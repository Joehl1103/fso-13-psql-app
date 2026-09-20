import bcrypt from "bcrypt";
import express from "express";

import { User } from "../models/index.js";

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

function parseUser(body) {
  const errorMessages = [];
  const { username, name, password } = body;
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
  try {
    const userParse = parseUser(req.body);
    if (userParse.length > 0) {
      let errorMessage;
      if (userParse.length > 1) {
        errorMessage = userParse.join(", ");
      } else {
        console.log("here");
        errorMessage = userParse[0];
      }
      throw new Error(errorMessage);
    }
    // const result = await User.create(req.body);
    // res.status(200).end(JSON.stringify(result));
    res.status(201).end();
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

router.get("/", async (req, res) => {
  console.log("hello");
  const users = await User.findAll();
  console.log(users);
});

export default router;
