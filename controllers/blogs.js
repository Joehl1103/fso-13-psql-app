import express from "express";

import { Blog } from "../models/index.js";

const router = express.Router();

function printError(error) {
  console.log(`Error: ${error.message}`);
}

router.get("/", async (req, res) => {
  console.log("hello");
  try {
    const results = await Blog.findAll();
    res.json(results);
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

router.post("/", async (req, res) => {
  try {
    const result = await Blog.create(req.body);
    res.status(200).json(result);
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const response = await Blog.update(
      { likes: body.likes },
      { returning: true, where: { id: id } },
    );
    res.status(200).json(response[1]);
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Blog.destroy({ where: { id: id } });
    res.status(204).end();
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

export default router;
