import express from "express";
import { Blog } from "../models/index.ts";
import { Op } from "sequelize";
import { ErrorWithCustomStatus } from "../util/errorTypes.ts";
import { sequelize } from "../util/db.ts";
import { Author } from "../models/types/author.types.ts";

const router = express.Router();

const RES_KEY_LEN: number = 3;

function buildAuthorObjects(blogResponse: Blog[]): Author[] {
  return blogResponse.map((b: Blog) => {
    const keys: string[] = Object.keys(b);
    if (!b || keys.length === 0) {
      throw new Error();
    }
    if (typeof b !== "object" && keys.length !== RES_KEY_LEN) {
      throw new Error();
    }
    if (!("author" in b && "likes" in b && "blogs" in b)) {
      throw new Error();
    }
    for (const value of Object.values(b)) {
      if (typeof value !== "string") {
        throw new Error();
      }
    }
    return new Author(b.author, Number(b.likes), Number(b.blogs));
  });
}

router.get("/", async (req, res, next) => {
  try {
    const blogRes1: Blog[] = await Blog.findAll();
    const authorNames: string[] = blogRes1.map((b: Blog) => b.author);
    const blogRes2: Blog[][] = await Promise.all(
      authorNames.map(async (a: string) => {
        const res = await Blog.findAll({
          attributes: [
            [sequelize.fn("COUNT", sequelize.col("author")), "blogs"],
            [sequelize.fn("SUM", sequelize.col("likes")), "likes"],
            "author",
          ],
          where: {
            author: {
              [Op.eq]: a,
            },
          },
          group: ["author"],
        });
        return res;
      }),
    );
    const aggBlogs: Blog[] = blogRes2.map((arr: Blog[]): Blog => {
      if (arr.length > 1) {
        throw new Error();
      }
      const item: Blog | undefined = arr[0];
      if (!item) {
        throw new Error();
      }
      return item.toJSON();
    });
    if (!aggBlogs || aggBlogs.length === 0) {
      throw new Error("No blogs");
    }
    const authors: Author[] = buildAuthorObjects(aggBlogs);
    const authorsSorted: Author[] = authors.sort(
      (a: Author, b: Author) => b.likes - a.likes,
    );
    res.status(200).send(authorsSorted);
  } catch (e) {
    if (e instanceof Error || e instanceof ErrorWithCustomStatus) {
      next(e);
    }
  }
});

export default router;
