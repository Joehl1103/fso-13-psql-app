import express from "express";

const router = express.Router();

import type { ReadingListReqBody } from "./readingList.types.ts";

router.post("/", async (req, res) => {
  const body: ReadingListReqBody = req.body;
});
