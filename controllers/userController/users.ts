import bcrypt from "bcrypt";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { User } from "../../models/index.js";
import type {
  UserNoPW,
  UserRequestType,
  UserPOSTResponseTypeFromAPI,
  FindASingleUserResponse,
  SequelizeUserUpdateResult,
} from "../../models/types/user.d.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import { parseUser, getUserIdToBlogMap } from "./userHelpers.ts";
import config from "../../util/config.ts";
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
    if (!req.params.id) {
      throw new Error("No id.");
    }
    const id: number = Number(req.params.id);
    const userIdToBlogMap: UserIdToBlogMap = req.userIdToBlogMap;
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new ErrorWithCustomStatus(
          404,
          "Unable to find user with that id.",
        );
      }
      const { password, ...rest } = user.dataValues;
      const blogIds: number[] | any[] | undefined | null =
        userIdToBlogMap.get(id) ?? [];
      const output: UserNoPW = { ...rest, blogs: blogIds };
      res.status(200).json(output);
    } catch (error) {
      next(error);
    }
  },
);

router.put("/:username", async (req, res, next) => {
  const username: string = req.params.username;
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new ErrorWithCustomStatus(400, "no update content");
    }
    const user: User | null = await User.findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      throw new ErrorWithCustomStatus(
        404,
        "unable to find a user by that username",
      );
    }
    const response: SequelizeUserUpdateResult = await User.update(req.body, {
      where: { username: username },
      returning: true,
    });
    const [affectedCount, affectedRows] = response;
    if (affectedCount !== 1 || !affectedRows) {
      throw Object.assign(
        new Error(
          `Affected rows greater than or less than original. Affected rows: ${affectedCount}`,
        ),
        {
          status: 500,
        },
      );
    }
    const { name: returnedName, username: returnedUsername } =
      affectedRows[0] as User;
    res.status(200).json({ username: returnedUsername, name: returnedName });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  const id: string | null = req.params.id;
  if (!id) {
    throw new ErrorWithCustomStatus(500, `No id in params`);
  }

  try {
    const findByPkRes: FindASingleUserResponse = await User.findByPk(id);
    if (!findByPkRes) {
      throw new ErrorWithCustomStatus(500, `No user with id: ${id}`);
    }
    if (!findByPkRes) {
      throw new ErrorWithCustomStatus(500, "No user by that id.");
    }
    const destroyRes = await User.destroy({ where: { id: id } });
    if (destroyRes !== 1) {
      throw new ErrorWithCustomStatus(
        500,
        `number of destroyed rows greater than or less than expected (1): ${destroyRes}`,
      );
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
