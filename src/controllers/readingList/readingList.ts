import express from "express";

const router = express.Router();

import type { ReadingListReqBody, ReadingListResBody,ReadingListPayload } from "./readingList.types.ts";

import { User, ReadingList} from "../../models/index.ts"
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";

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
  const userExists = async (userId: string): Promise<boolean> => { 
    const res = await User.findByPk(userId);
    return !!res
  };
  // if(!userExists){
  //   throw new ErrorWith
  // }
  console.log('userExists ', userExists)
  const payload: ReadingListPayload = {...body,read: false};

  const response = await ReadingList.create(payload);

  res.status(200).json(response);
});

export default router
