import express from "express";

const router = express.Router();

import type { ReadingListReqBody, ReadingListResBody,ReadingListPayload } from "./readingList.types.ts";

import { User,Blog, ReadingList} from "../../models/index.ts"
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import type {Model,ModelStatic} from 'sequelize'

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
  const payload: ReadingListPayload = {blogId: Number(blogId), userId: Number(userId),read: false};

  const response = await ReadingList.create(payload);

  res.status(200).json(response);
});

export default router
