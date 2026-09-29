import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SECRET } from "../util/config.js";
import { User } from "../models/index.js";
const router = express.Router();

if (!SECRET) {
  throw new Error("SECRET string is empty");
}

function printReq(req, res, next) {
  console.log({
    body: req.body,
  });
  next();
}

router.post("/", async (req, res, next) => {
  const body = req.body;
  const { password: receivedPassword } = body;
  try {
    const user = await User.findOne({ where: { username: body.username } });
    const { password: hashedPassword, username, id } = user;
    const passwordCorrect = await bcrypt.compare(
      receivedPassword,
      hashedPassword,
    );
    if (!passwordCorrect) {
      throw Object.assign(new Error(`Incorrect password`), {
        status: 401,
      });
    }

    const token = jwt.sign({ username, id }, SECRET);
    res.status(200).json({ token, username, id });
  } catch (error) {
    console.log("error", error);
    next(error);
  }
});

export default router;
