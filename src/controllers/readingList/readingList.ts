// packages and methods
import express from "express";
import { extractToken,requireStringParam, verifyUserFromToken } from "../helpers.ts"; 
import jwt from "jsonwebtoken"
import { User,Blog, ReadingList} from "../../models/index.ts"
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import config from "../../util/config.ts"

// types
import type { 
  ReadingListReqBody, 
  ReadingListResBody,
  ReadingListSequelizePayload 
} from "./readingList.api.types.ts";
import type {Model,ModelStatic, InferAttributes} from 'sequelize'
import type { JwtUserPayload } from "../controllers.types.general.ts";
import { checkForReadingListExistence,checkForRecordExistence } from "./readingListHelpers.ts";

// Helpers


//INITIALIZATION
const router = express.Router();
const SECRET = config.SECRET

// ROUTER 


router.post("/", async (req, res, next) => {
  const body: ReadingListReqBody = req.body;
  if((typeof body === 'string' && !body) || (typeof body === 'object' && Object.keys(body).length === 0)){
    throw new ErrorWithCustomStatus(400,
      `request must contain a payload of shape:
        {
          blogId: number,
          userId: number
        }
`)
  }
  const { userId, blogId } = body
  if (!userId || !blogId){
    const hasUserId = !!userId
    const hasBlogId = !!blogId
    throw new ErrorWithCustomStatus(400,`
      Missing data from payload:
        {
          blogId: ${hasBlogId ? blogId : 'absent' },
          userId: ${hasUserId ? userId : 'absent' }
        }
`)
  }
  try {
    const payload: ReadingListSequelizePayload = {blogId: Number(blogId), userId: Number(userId),read: false};
    const alreadyExists: boolean = await checkForReadingListExistence(Number(userId),Number(blogId))
    if(alreadyExists){
      throw new ErrorWithCustomStatus(400,`Reading list already exists for blogId ${blogId}`);
    }
    const response: InferAttributes<ReadingList> = await ReadingList.create(payload, { returning: true });
    res.status(200).json(response);
  } catch (error){
    if (error instanceof Error){
      next(error)
    }
  }
});


interface ParamObject {
  name: string,
  value: string | string[] | undefined
}

router.put("/:id", extractToken, async (req,res,next) => {
  const id: string = requireStringParam('id',req.params.id)
  const token: string = requireStringParam('token',req.token)
  try {
    const current: ReadingList | null = await ReadingList.findByPk(id)
    if(!current){
      throw new ErrorWithCustomStatus(404,`Cannot find a reading list entry with id: ${id}`)
    }
    await verifyUserFromToken(token,SECRET,current.userId.toString())
    if(!(Object.keys(current.toJSON()).includes('read'))){
      throw new Error(`Something went wrong. No read property on reading list entry with id ${id}`)
    }
    const { read: currentRead } = current.toJSON()
    const updated = await ReadingList.update({ read: !currentRead },
      {
        where: { id: id },
        returning: true
      }
    )
    if(!updated){
      throw new Error('Something went wrong with the update')
    }
    const [affectedCount,affectedRows] = updated
    if(!(affectedCount == 1) || !affectedRows || affectedRows.length !== 1 || !affectedRows[0]){
      throw new Error(`Something went wrong with the update. Affected count should be 1 and is ${affectedCount}`)
    }
    if(affectedRows[0].read == current.read){
      throw new Error(`Update method did not work. Read status was not changed`)
    }
    res.status(200).send(affectedRows[0])
  } catch (error){
    if (error instanceof Error){
      next(error)
    }
  }
})

export default router
