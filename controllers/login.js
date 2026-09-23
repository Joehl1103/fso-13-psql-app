import express from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../util/config.js";
import { User } from "../models/index.js";
const router = express.Router();

if (!SECRET) {
  throw new Error("SECRET string is empty");
}

router.post("/", async (req, res, next) => {
  console.log("hello");
  const body = request.body;
  try {
    const user = await User.findOne({ where: { username: body.username } });
    console.log("user", user);
    console.log("login");
    res.status(200).end("login");
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

export default router;
