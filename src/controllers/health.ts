import express from "express";
const router = express.Router();

router.get("/", async (req, res, next) => {
  console.log("health");
  res.status(200).send("healthy\n");
});

export default router;
