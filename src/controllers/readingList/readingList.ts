import express from "express";

const router = express.Router();

import type { ReadingListReqBody, ReadingListResBody,ReadingListPayload } from "./readingList.types.ts";

import ReadingList from "../../models/readingList.ts";

router.post("/", async (req, res) => {
  const body: ReadingListReqBody = req.body;
  console.log('body',body)

  const payload: ReadingListPayload = {...body,read: false}
  console.log('payload',payload)

  try {
  const response = await ReadingList.create(payload)

  res.status(200).json(response)
  } catch(e){
    console.log('e',e.message)
  }
});

export default router
