import { ErrorWithCustomStatus } from "../util/errorTypes.ts";
import type { Request, Response, NextFunction } from "express";
import type { JwtUserPayload } from "./controllers.types.general.ts";
import config from "../util/config.ts"
const SECRET = config.SECRET
import jwt from "jsonwebtoken"
import { User,Session } from "../models/index.ts"
import { jwtRegex } from "../../testing/testingHelpers.ts";

function parseAuth(auth: string): string {
  const authHasRightFormat: Boolean =
    /Bearer\s{1}[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]/.test(auth);
  if (!authHasRightFormat) {
    throw new Error("Format of Bearer token is incorrect.");
  }
  const token = auth.split(" ")[1];
  if (!token || typeof token !== "string") {
    throw new Error("Something went wrong while trying to process this auth header.");
  }
  return token;
}

function extractToken(req: Request, res: Response, next: NextFunction) {
  const auth: string | undefined = req.get("Authorization");
  if(!auth){
    throw new Error('An authorization token is required for this request.')
  }
  const token: string = parseAuth(auth);
  req.token = token;
  next();
}

function requireStringParam(name: string,value: string | string[] | undefined):string {
  if(Array.isArray(value)){
    throw new Error(`This method only accepts a single id.`)
  }
  if(typeof value !== 'string' || value === ''){
    console.log(`${name} must be a non-empty string`)
    throw new Error(`${name} must be a non-empty string`)
  }
  return value
}

//NOTE: I don't like that compId is optional. It couples too many operations in the same function
async function verifyUserFromToken(token: string, secret: string, compId: string | null = null): Promise<User> {
  //NOTE: I don't know why this is happening.
  const session = await Session.findOne({ where: { token: token }})
  if(!session){
    throw new Error('Unable to find a session for this token.')
  }
  if(!session.active){
    throw new Error('Cannot perform this action on this session. User must log in.')
  }
  const jwtPayload: JwtUserPayload = jwt.verify(token,SECRET)
  const user = await User.findOne({
      where: { username: jwtPayload.username },
    });
  if (!user) {
    throw new Error(`No user found with id ${jwtPayload.id}`)
  }

  if(!user){
    throw new Error("Something went wrong because there is no user that can be identified by that token.")
  }
  //NOTE: I don't like that this is optional
  if (compId && compId !== user.id.toString()) {
      throw new ErrorWithCustomStatus(401,
        "Cannot fulfill request because token does not belong to owner.",
      );
  }
  return user
}

export { parseAuth, extractToken, requireStringParam, verifyUserFromToken};
