import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../../util/config.ts";
const SECRET = config.SECRET;
import { User,Session } from "../../models/index.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
const router = express.Router();
import { addLoginSession } from "./loginHelpers.ts";

if (!SECRET) {
  throw new Error("SECRET string is empty");
}

interface UserAndPassword {
  username: string;
  password: string;
}

interface LoginRes {
  token: string;
  username: string;
  name: string;
  id: number;
  sessionId: number
}

router.post("/", async (req, res, next) => {
  const body: UserAndPassword = req.body;
  const { password: receivedPassword } = body;
  try {
    const user: User | null = await User.findOne({ where: { username: body.username } });
    if(!user){
      throw new Error(`No user with username: ${body.username}`)
    }
    const { password: hashedPassword, username, id } = user;

    const passwordCorrect: boolean = await bcrypt.compare(
      receivedPassword,
      hashedPassword,
    );

    if (!passwordCorrect) {
      throw new ErrorWithCustomStatus(401,"Incorrect password");
    }
    const token: string = jwt.sign({ username, id }, SECRET);

    const sessionId: number = await addLoginSession(token,user.id)
    const loginRes: LoginRes = {token,username,name: user.name,id,sessionId}
    res.status(200).json(loginRes);
  } catch (error) {
    next(error);
  }
});

export default router;
