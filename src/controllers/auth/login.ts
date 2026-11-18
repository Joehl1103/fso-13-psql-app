import express, { type NextFunction } from "express";
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

function printReq(req: Request, res: Response, next: NextFunction) {
  console.log({
    body: req.body,
  });
  next();
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
  console.group('login group')
  const body: UserAndPassword = req.body;
  const { password: receivedPassword } = body;
  try {
    const user: User | null = await User.findOne({ where: { username: body.username } });
    if(!user){
      throw new Error(`No user with username: ${body.username}`)
    }
    const { password: hashedPassword, username, id } = user;

    console.log('a')
    const passwordCorrect: boolean = await bcrypt.compare(
      receivedPassword,
      hashedPassword,
    );

    console.log('b')
    if (!passwordCorrect) {
      throw new ErrorWithCustomStatus(401,"Incorrect password");
    }
    console.log('c')
    const token: string = jwt.sign({ username, id }, SECRET);

    console.log('d')
    const sessionId: number = await addLoginSession(token,user.id)
    console.log('e')
    const loginRes: LoginRes = {token,username,name: user.name,id,sessionId}
    console.log('f')
    res.status(200).json(loginRes);
  } catch (error) {
    next(error);
  }
  console.groupEnd()
});

export default router;
