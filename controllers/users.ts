import bcrypt from "bcrypt";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { User } from "../models/index.js";
import type {
  UserNoPW,
  UserRequestType,
  UserPOSTResponseTypeFromAPI,
} from "../models/modelTypes.ts";
import { ErrorWithCustomStatus } from "../util/errorTypes.ts";
import { parseUser, getUserIdToBlogMap } from "./userHelpers.ts";
import config from "../util/config.ts";
import type { UserIdToBlogMap } from "./userTypes.ts";
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

router.get("/", getUserIdToBlogMap, async (req: Request, res, next) => {
  const userIdToBlogMap: UserIdToBlogMap = req.userIdToBlogMap;
  try {
    const response = await User.findAll();
    const returnedUsersWithoutPassword: UserNoPW[] = response
      .map((u) => u.toJSON())
      .map((u) => {
        const { password, ...rest } = u;
        return { ...rest, blogs: [] };
      });
    const usersWithBlogs: UserNoPW[] = returnedUsersWithoutPassword.map((u) => {
      const blogIdArray: number[] | undefined = userIdToBlogMap.get(u.id);
      if (blogIdArray === undefined) {
        return { ...u, blogs: [] };
      }
      return { ...u, blogs: blogIdArray };
    });
    res.status(200).json(usersWithBlogs);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:id",
  getUserIdToBlogMap,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("in GET :/id");
    if (!req.params.id) {
      throw new Error("No id.");
    }
    const id: number = Number(req.params.id);
    console.log("id", id);
    const userIdToBlogMap: UserIdToBlogMap = req.userIdToBlogMap;
    console.log("userIdToBlogMap", userIdToBlogMap);
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new ErrorWithCustomStatus(
          404,
          "Unable to find user with that id.",
        );
      }
      const { password, ...rest } = user.dataValues;
      console.log("id", id);
      console.log("userIdToBlogMap", userIdToBlogMap);
      console.log("userIdToBlogMap.get(id)", userIdToBlogMap.get(id));
      const output: UserNoPW = { ...rest, blogs: userIdToBlogMap.get(id) };
      console.log("THIS output", output);
      res.status(200).json(output);
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
