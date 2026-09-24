import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET, SALT_ROUNDS } from "../util/config.js";
import { User } from "../models/index.js";
const router = express.Router();

if (!SECRET) {
  throw new Error("SECRET string is empty");
}

router.post("/", async (req, res, next) => {
  console.log("hello");
  const body = req.body;
  console.log("body", body);
  try {
    const user = await User.findOne({ where: { username: body.username } });
    const { password } = user;
    const passwordCorrect = bcrypt.compare(password, SALT_ROUNDS);
    if (!passwordCorrect) {
      throw Object.assign(new Error(`Incorrect password`), {
        status: 401,
      });
    }
    console.log("user", user);
    console.log("login");
    res.status(200).end("login");
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

export default router;
