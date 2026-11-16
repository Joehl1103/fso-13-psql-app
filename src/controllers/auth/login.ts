import express, { type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../../util/config.ts";
const SECRET = config.SECRET;
import { User } from "../../models/index.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
const router = express.Router();

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
  id: string;
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
    const loginRes: LoginRes = {token,username,id: String(id)}
    res.status(200).json(loginRes);
  } catch (error) {
    next(error);
  }
});

export default router;
