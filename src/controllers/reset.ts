import express from "express";
const router = express.Router();
import { sequelize } from "../../db/utils/db.ts";

router.post("/", async (req, res, next) => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });
  res.status(204).end();
});

export default router;
