import express from "express"
import jwt from "jsonwebtoken"
import config from "../../util/config.ts";
import { extractToken, verifyUserFromToken } from "../helpers.ts";
import {Session} from "../../models/index.ts"
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import type { SequelizeUpdateResult } from "../../db/utils/db.types.ts";

const SECRET: string = config.SECRET 

const router = express.Router()

router.post('/',extractToken,async (req,res,next) => {
  try {
    console.log('here')
    const token: string = req.token
    const {sessionId} = req.body
    if(!sessionId){
      throw new Error('Request must contain a session id.')
    }
    const session = await Session.findByPk(sessionId)
    if(!session){
      throw new ErrorWithCustomStatus(404,`Unable to find a session with id ${sessionId}`)
    }
    await verifyUserFromToken(token,SECRET,String(session.userId))
    const updateResult: SequelizeUpdateResult<Session> = await Session.update({ active: false },{
      where: { id: sessionId },
      returning: true
    })
    if(!updateResult || updateResult[0] !== 1 || !updateResult[1][0]){
      throw new Error(`Number of affected rows should be 1 and is ${updateResult[0]}`)
    }
    res.status(200).json({ sessionId: updateResult[1][0].id, active: updateResult[1][0].active})
  } catch (error){
    if(error instanceof Error){
      next(error)
    }
  }
})

export default router
