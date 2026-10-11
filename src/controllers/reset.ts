import express from "express";
const router = express.Router();
import { sequelize } from "../../db/utils/db.ts";

router.post("/reset", async (req, res, next) => {
  await sequelize.truncate({});
});
