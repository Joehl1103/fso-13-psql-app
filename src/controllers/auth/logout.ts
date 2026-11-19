import express from "express"
import jwt from "jsonwebtoken"
import config from "../../util/config.ts";
import { extractToken, verifyUserFromToken } from "../helpers.ts";
import { Session, User } from "../../models/index.ts"
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import type { SequelizeUpdateResult } from "../../db/utils/db.types.ts";

const SECRET: string = config.SECRET 

const router = express.Router()

router.delete('/',extractToken, async (req,res,next) => {
  try {
    const token: string = req.token
    const user: User = await verifyUserFromToken(token,SECRET)
    const session: number = await Session.destroy({ where: { userId: user.id }, individualHooks: true });
    if(!session || session == 0){
      throw new ErrorWithCustomStatus(404,'Unable to delete session.')
    }
    res.status(204).end();
  } catch (error){
    if(error instanceof Error){
      next(error)
    }
  }
})

export default router
