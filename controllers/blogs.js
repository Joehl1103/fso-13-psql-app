import express from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../util/config.js";
import { blogPostValidator, readRequest } from "../util/middleware.js";

import { Blog, User } from "../models/index.js";

const router = express.Router();

function printError(error) {
  console.log(`Error: ${error.message}`);
}

router.get("/", async (req, res) => {
  try {
    const results = await Blog.findAll();
    res.status(200).json(results);
  } catch (error) {
    printError(error);
    res.status(404).end();
  }
});

router.post("/", async (req, res) => {
  const token = req.body.token;
  if (!token) {
    throw Object.assign(new Error(`No token present`), {
      status: 500,
    });
  }
  try {
    const userFromDecodedToken = jwt.verify(token, SECRET);
    const user = await User.findOne({
      where: { username: userFromDecodedToken.username },
    });
    if (!user) {
      throw Object.assign(
        new Error(`No user found with id ${userFromDecodedToken.id}`),
        {
          status: 500,
        },
      );
    }
    const payload = {
      author: req.body.author,
      url: req.body.url,
      title: req.body.title,
      userId: user.id,
      likes: 0,
    };
    const result = await Blog.create(payload);
    res.status(200).json(result.toJSON());
  } catch (error) {
    next(error);
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
