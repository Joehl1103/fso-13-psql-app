import bcrypt from "bcrypt";
import express from "express";

import { User } from "../models/index.js";

const router = express.Router();

const SALT_ROUNDS = 10;

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
      username: returnedUsername,
      name: returnedName,
      ...rest
    } = result.toJSON();
    res.status(201).json({ username: returnedUsername, name: returnedName });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res) => {
  try {
    const response = await User.findAll();
    const users = response
      .map((u) => u.toJSON())
      .map((u) => {
        const { username, name, ...rest } = u;
        return { username, name };
      });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.put("/:username", async (req, res, next) => {
  const username = req.params.username;
  try {
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
  } catch (error) {
    next(error);
  }
});

export default router;
