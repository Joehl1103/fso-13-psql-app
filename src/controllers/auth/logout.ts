import express from "express"
import jwt from "jsonwebtoken"
import config from "../../util/config.ts";
import { extractToken, verifyUserFromToken } from "../helpers.ts";
import {Session} from "../../models/index.ts"
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import type { SequelizeUpdateResult } from "../../db/utils/db.types.ts";

const SECRET: string = config.SECRET 

const router = express.Router()

router.delete('/',extractToken, async (req,res,next) => {
  console.group('logout group')
  try {
    const token: string = req.token
    await verifyUserFromToken(token,SECRET)
    const session = await Session.destroy({ where: { token: token }});
    console.log('here')
    if(session !== 1){
      throw new ErrorWithCustomStatus(404,'Unable to delete session.')
    }
    res.status(204).end();
  } catch (error){
    if(error instanceof Error){
      console.warn('error',error.message)
      next(error)
    }
  }
  console.groupEnd()
})

export default router
