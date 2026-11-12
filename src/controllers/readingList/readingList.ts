// packages and methods
import express from "express";
import { extractToken,requireStringParam } from "../helpers.ts"; 
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

// Helpers
async function checkForRecordExistence(id: string,message: string, model: ModelStatic<User | Blog>): Promise<void> {
  const recordExists = await (async (id: string): Promise<boolean> => {
    const res = await model.findByPk(id);
    return !!res
  })(id)
  console.log('recordExists',recordExists)
  console.log('message',message)
  if(!recordExists){
    console.log('here')
    throw new ErrorWithCustomStatus(400,message)
  }
  return
}

//INITIALIZATION
const router = express.Router();
const SECRET = config.SECRET

// ROUTER 

router.post("/", async (req, res) => {
  const body: ReadingListReqBody = req.body;
  console.log('body',body)
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

  const items = [
    {
      id: blogId,
      message: `blog does not exist for blog id: ${blogId}`,
      model: Blog
    },
    {
      id: userId,
      message:`user does not exist for user id: ${userId}`,
      model: User
    }
  ]
  for (const item of items){
    const {id,message,model} = item
    await checkForRecordExistence(id,message,model)
  }
  const payload: ReadingListSequelizePayload = {blogId: Number(blogId), userId: Number(userId),read: false};

  const response: InferAttributes<ReadingList> = await ReadingList.create(payload, { returning: true });
  res.status(200).json(response);
});


interface ParamObject {
  name: string,
  value: string | string[] | undefined
}

function verifyUserFromToken(token: string, secret: string, compId): void {
  const user: JwtUserPayload = jwt.verify(token,SECRET) as JwtUserPayload
  if(!user){
    throw new Error("Something went wrong because there is no user that can be identified by that token.")
  }
}

router.put("/:id", extractToken, async (req,res) => {
  const id: string = requireStringParam('id',req.params.id)
  const token: string = requireStringParam('token',req.params.token)
  const current: ReadingList | null = await ReadingList.findByPk(id)
  if(!current){
    throw new ErrorWithCustomStatus(404,`Cannot find a reading list entry with id: ${id}`)
  }
  if(!(Object.keys(current.toJSON()).includes('read'))){
    throw new Error(`Something went wrong. No read property on reading list entry with id ${id}`)
  }
  const { read: currentRead } = current.toJSON()
  const updated = await ReadingList.update({read: !currentRead }, 
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
    console.warn('updated object',updated)
    throw new Error(`Something went wrong with the update. Affected count should be 1 and is ${affectedCount}`)
  }
  if(affectedRows[0].read == current.read){
    throw new Error(`Update method did not work. Read status was not changed`)
  }
  res.status(200).send(affectedRows[0])
})

export default router
