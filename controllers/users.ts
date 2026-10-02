import bcrypt from "bcrypt";
import express from "express";

import { User, Blog } from "../models/index.js";
import type {
  UserNoPW,
  UserRequestType,
  BlogResType,
} from "../models/modelTypes.ts";
import { ErrorWithCustomStatus } from "../util/errorTypes.ts";
import config from "../util/config.ts";
const { SALT_ROUNDS } = config;

const router = express.Router();

function parsePassword(password: string) {
  const errorMessages = [];
  const pwLen = password.length;
  if (pwLen < 8) {
    errorMessages.push("pw too short. Minimum 8 characters.");
    return errorMessages;
  }
  const hasUC = /[A-Z]/.test(password);
  const hasLC = /[a-z]/.test(password);
  const hasNum = /[\d]/.test(password);
  const hasSC = /[^A-Za-z0-9\s]/.test(password);
  if (!hasUC || !hasLC || !hasNum || !hasSC) {
    errorMessages.push(
      "Password must contain at least one upper case letter, one lower case letter, one number and onespecialCharacter.",
    );
  }
  return errorMessages;
}

function parseUser(username: string, name: string, password: string) {
  const errorMessages = [];
  if (!username) {
    errorMessages.push("no username.");
  }
  if (!name) {
    errorMessages.push("no name.");
  }
  if (!password) {
    errorMessages.push("no password");
  } else {
    const pwAnalysis = parsePassword(password);
    if (pwAnalysis.length > 0) {
      errorMessages.push(pwAnalysis);
    }
  }
  return errorMessages;
}

router.post("/", async (req, res, next) => {
  const body: UserRequestType = req.body;
  const { username, name, password } = body;
  try {
    const userParse = parseUser(username, name, password);
    if (userParse.length > 0) {
      let errorMessage;
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
    const payload: UserResponseType = {
      id,
      username: returnedUsername,
      name: returnedName,
    };
    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
});

type UserIdToBlogMap = Map<number, number[] | any[]>;

function buildUserIdToBlogIdMap(
  userIds: number[],
  blogs: BlogResType[],
): Map<number, number[]> {
  const userIdToBlogIdMap: UserIdToBlogMap = new Map(
    userIds.map((id) => [id, []]),
  );
  console.group("forEach");
  blogs.forEach((b) => {
    console.log("A");
    const userIdExists: boolean = userIdToBlogIdMap.has(b.userId);
    console.log("B");
    if (userIdExists) {
      //NOTE: I do not know why this could be undefined, since I am initializing the [userId,[]] and then checking whether or not the userId exists
      const blogIdArray: number[] | any[] | undefined = userIdToBlogIdMap.get(
        b.userId,
      );
      if (blogIdArray !== undefined && !blogIdArray.includes(b.id)) {
        const newBlogIdArray: number[] = [...blogIdArray, b.id];
        userIdToBlogIdMap.set(b.userId, newBlogIdArray);
      } else {
        userIdToBlogIdMap.set(b.userId, [b.id]);
      }
    } else {
      throw Error(`User id ${b.userId} does not exists`);
    }
  });
  console.groupEnd();
  return userIdToBlogIdMap;
}

router.get("/", async (req, res, next) => {
  console.log("here");
  try {
    const response = await User.findAll();
    console.log("here-1");
    const returnedUsersWithoutPassword: UserNoPW[] = response
      .map((u) => u.toJSON())
      .map((u) => {
        const { password, ...rest } = u;
        return { ...rest, blogs: [] };
      });
    const userIds: number[] = response.map((u) => u.toJSON()).map((u) => u.id);
    console.log("here-2");
    const allBlogs = await Blog.findAll();
    console.log("here-3");
    const allBlogsJson = allBlogs.map((b) => b.toJSON()) as BlogResType[];
    console.log("here-4");
    const userIdToBlogIdMap: Map<number, number[]> = buildUserIdToBlogIdMap(
      userIds,
      allBlogsJson,
    );
    const usersWithBlogs: UserNoPW[] = returnedUsersWithoutPassword.map((u) => {
      const blogIdArray: number[] | undefined = userIdToBlogIdMap.get(u.id);
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

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw new ErrorWithCustomStatus(404, "Unable to find user with that id.");
    }
    const { password, ...rest } = user.dataValues;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
});

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
