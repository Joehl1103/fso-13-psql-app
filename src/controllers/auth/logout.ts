import express from "express"
import jwt from "jsonwebtoken"
import config from "../../util/config.ts";

const SECRET: string = config.SECRET 

const router = express.Router()

router.post('/api/logout',(req,res,next) => {
  if(!req.headers.authorization){
    throw new Error('Request must contain an authorization header.')
  }
  const token: string = req.headers.authorization;
  const user = jwt.verify(token)
})

export default router
