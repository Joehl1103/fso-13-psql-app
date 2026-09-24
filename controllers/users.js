import bcrypt from "bcrypt";
import express from "express";

import { User } from "../models/index.js";
import { SALT_ROUNDS } from "../util/config.js";

const router = express.Router();

function parsePassword(password) {
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

function parseUser(username, name, password) {
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
  const { username, name, password } = req.body;
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
    res
      .status(201)
      .json({ id, username: returnedUsername, name: returnedName });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const response = await User.findAll();
    const users = response
      .map((u) => u.toJSON())
      .map((u) => {
        const { password, ...rest } = u;
        return rest;
      });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw Object.assign(new Error("Unable to find user with that id."), {
        status: 404,
      });
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
