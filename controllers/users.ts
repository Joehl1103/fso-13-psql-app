import bcrypt from "bcrypt";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { User, Blog } from "../models/index.js";
import type {
  UserNoPW,
  UserRequestType,
  BlogResType,
  UserResponseTypeFromSequelize,
  UserPOSTResponseTypeFromAPI,
} from "../models/modelTypes.ts";
import { ErrorWithCustomStatus } from "../util/errorTypes.ts";
import { parseUser, buildUserIdToBlogIdMap } from "./userHelpers.ts";
import config from "../util/config.ts";
const { SALT_ROUNDS } = config;

const router = express.Router();

router.post("/", async (req, res, next) => {
  const body: UserRequestType = req.body;
  const { username, name, password } = body;
  try {
    const userParse = parseUser(username, name, password);
    if (userParse.length > 0) {
      let errorMessage: string;
      if (userParse.length > 1) {
        errorMessage = userParse.join(", ");
      } else {
        errorMessage = userParse[0];
      }
      throw new Error(errorMessage);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await User.create({ ...req.body, password: passwordHash });
    const {
      id,
      username: returnedUsername,
      name: returnedName,
      ...rest
    } = result.toJSON();
    const payload: UserPOSTResponseTypeFromAPI = {
      id,
      username: returnedUsername,
      name: returnedName,
    };
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

interface GetUserIdRequest extends Request {}

async function getUserIdToBlogMap(
  req: GetUserIdRequest,
  res: Response,
  next: NextFunction,
) {
  const users: User[] = await User.findAll();
  const usersJson: UserResponseTypeFromSequelize[] = users.map((u) =>
    u.toJSON(),
  );
  const userIds: number[] = usersJson.map(
    (u: UserResponseTypeFromSequelize) => u.id,
  );
  const allBlogs = await Blog.findAll();
  const allBlogsJson = allBlogs.map((b) => b.toJSON()) as BlogResType[];
  const userIdToBlogMap: Map<number, number[] | any[]> = buildUserIdToBlogIdMap(
    userIds,
    allBlogsJson,
  );
  console.log("userIdToBlogMap", userIdToBlogMap);
  req.userIdToBlogMap = userIdToBlogMap as any;
  next();
}

router.get(
  "/",
  getUserIdToBlogMap,
  async (req: GetUserIdRequest, res, next) => {
    const userIdToBlogMap: Map<number, number[] | any[]> =
      req.body.userIdToBlogMap;
    try {
      const response = await User.findAll();
      const returnedUsersWithoutPassword: UserNoPW[] = response
        .map((u) => u.toJSON())
        .map((u) => {
          const { password, ...rest } = u;
          return { ...rest, blogs: [] };
        });
      const usersWithBlogs: UserNoPW[] = returnedUsersWithoutPassword.map(
        (u) => {
          const blogIdArray: number[] | undefined = userIdToBlogMap.get(u.id);
          if (blogIdArray === undefined) {
            return { ...u, blogs: [] };
          }
          return { ...u, blogs: blogIdArray };
        },
      );
      res.status(200).json(usersWithBlogs);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/:id",
  getUserIdToBlogMap,
  async (req: GetUserIdRequest, res, next) => {
    if (!req.params.id) {
      throw new Error("No id.");
    }
    const id: number = Number(req.params.id);
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new ErrorWithCustomStatus(
          404,
          "Unable to find user with that id.",
        );
      }
      const { password, ...rest } = user.dataValues;
      res.status(200).json(rest);
    } catch (error) {
      next(error);
    }
  },
);

router.put("/:username", async (req, res, next) => {
  const username = req.params.username;
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw Object.assign(new Error("no update content"), {
        status: 400,
      });
    }
    const user = await User.findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      throw Object.assign(new Error("unable to find a user by that username"), {
        status: 404,
        code: "NOT_FOUND",
      });
    }
    const response = await User.update(req.body, {
      where: { username: username },
      returning: true,
    });
    const [numAffectedRows, rowRes] = response;
    if (numAffectedRows !== 1) {
      throw Object.assign(
        new Error(
          `Affected rows greater than or less than original. Affected rows: ${numAffectedRows}`,
        ),
        {
          status: 500,
        },
      );
    }
    const { name: returnedName, username: returnedUsername } = rowRes[0];
    res.status(200).json({ username: returnedUsername, name: returnedName });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const response = await User.destroy({ where: { id: id } });
    if (response !== 1) {
      throw Object.assign(
        new Error(
          `number of destroyed rows greater than or less than expected (1): ${response}`,
        ),
        {
          status: 500,
        },
      );
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
