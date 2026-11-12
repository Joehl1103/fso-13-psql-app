import { ErrorWithCustomStatus } from "../util/errorTypes.ts";
import type { Request, Response, NextFunction } from "express";
import type { JwtUserPayload } from "./controllers.types.general.ts";
import config from "../util/config.ts"
const SECRET = config.SECRET
import jwt from "jsonwebtoken"

function parseAuth(auth: string | undefined): string {
  if (!auth) {
    throw new ErrorWithCustomStatus(500, "No auth provided");
  }
  const authHasRightFormat: Boolean =
    /Bearer\s{1}[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]/.test(auth);
  if (!authHasRightFormat) {
    throw new ErrorWithCustomStatus(
      500,
      "Format of Bearer token is incorrect.",
    );
  }
  const token = auth.split(" ")[1];
  if (!token || typeof token !== "string") {
    throw new ErrorWithCustomStatus(
      500,
      "Something went wrong while trying to process this auth header.",
    );
  }

  return token;
}

function extractToken(req: Request, res: Response, next: NextFunction) {
  const auth: string | undefined = req.get("Authorization");
  const token: string = parseAuth(auth);
  //NOTE : add to index.d.ts
  req.token = token;
  next();
}

function requireStringParam(name: string,value: string | string[] | undefined):string {
  if(Array.isArray(value)){
    throw new Error(`This method only accepts a single id.`)
  }
  if(typeof value !== 'string' || value === ''){
    throw new Error(`${name} must be a non-empty string`)
  }
  return value
}

function verifyUserFromToken(token: string, secret: string, compId: string): void {
  const user: JwtUserPayload = jwt.verify(token,SECRET) as JwtUserPayload
  if(!user){
    throw new Error("Something went wrong because there is no user that can be identified by that token.")
  }
  if (compId !== user.id.toString()) {
      throw new Error(
        "Cannot fulfill request because token does not belong to owner.",
      );
    }
}



export { parseAuth, extractToken, requireStringParam, verifyUserFromToken};
