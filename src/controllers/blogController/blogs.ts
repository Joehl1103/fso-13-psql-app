import express from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import config from "../../util/config.ts";
const { SECRET } = config;
import type { BlogReqType, BlogResType } from "../../models/types/blog.d.ts";
import { Blog, User } from "../../models/index.ts";
import type { Request, Response } from "express";
import { Op } from "sequelize";
import type { WhereOptions } from "sequelize";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import type {
  RequestParams,
  ResponseBody,
  RequestBody,
  RequestQuery,
} from "./../api.d.ts";
import { parseAuth } from "./blogHelpers.ts";
import type { SequelizeUpdateResult } from "../../../db/db.js";

const router = express.Router();

if (!SECRET) {
  throw new Error("SECRET is undefined");
}

router.get(
  "/",
  async (
    req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>,
    res: Response,
  ) => {
    const searchParam: string = req.query.search ?? "";
    let where: WhereOptions = {};
    if (searchParam) {
      const subStringSearchParam = { [Op.substring]: searchParam };
      where = {
        [Op.or]: [
          { title: subStringSearchParam },
          { author: subStringSearchParam },
        ],
      };
    }
    try {
      const results: Blog[] = await Blog.findAll({
        where,
        order: [["likes", "DESC"]],
      });
      res.status(200).json(results);
    } catch (error) {
      if (error instanceof Error || error instanceof ErrorWithCustomStatus) {
        res.status(404).end();
      }
    }
  },
);

interface JwtUserPayload extends JwtPayload {
  username: string;
  id: number;
}

router.post("/", async (req, res, next) => {
  const body: BlogReqType = req.body;
  const auth: string | undefined = req.get("Authorization");
  try {
    const token: string = parseAuth(auth);
    const { author, url, title } = body;
    if (!token) {
      throw Object.assign(new Error(`No token present`), {
        status: 500,
      });
    }
    const jwtPayload = jwt.verify(token, SECRET) as JwtPayload;
    const user = await User.findOne({
      where: { username: jwtPayload.username },
    });
    if (!user) {
      throw Object.assign(new Error(`No user found with id ${jwtPayload.id}`), {
        status: 500,
      });
    }
    const payload: Omit<BlogResType, "id"> = {
      author,
      url,
      title,
      userId: user.id,
      likes: 0,
    };
    const result: Blog = await Blog.create(payload);
    res.status(200).json(result.toJSON());
  } catch (error) {
    next(error);
  }
});

interface BlogPatchBody {
  likes: number;
}

router.patch("/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    if (!id) {
      throw new ErrorWithCustomStatus(
        500,
        "Id not provided in request parameters",
      );
    }
    const body: BlogPatchBody = req.body;
    if (!body) {
      throw new ErrorWithCustomStatus(
        500,
        "Body empty in blog patch. Should provide `likes: number`",
      );
    }
    const response: SequelizeUpdateResult<Blog> = await Blog.update(
      { likes: body.likes },
      { returning: true, where: { id: id } },
    );
    const [affectedCount, affectedRows] = response;
    if (!(affectedCount === 1)) {
      throw new ErrorWithCustomStatus(
        500,
        `Number of affectedRows during blog update is not equal to 1: ${affectedCount}`,
      );
    }
    res.status(200).json(affectedRows[0]);
  } catch (error) {
    if (error instanceof Error || error instanceof ErrorWithCustomStatus) {
      res.status(404).end();
    }
  }
});

router.delete("/:id", async (req, res, next) => {
  //NOTE: no body means no token since only tokens are sent
  if (!req.body || !req.body.token) {
    throw Object.assign(new Error("No token provided"), {
      status: 500,
    });
  }
  const user: JwtUserPayload = jwt.verify(
    req.body.token,
    SECRET,
  ) as JwtUserPayload;
  if (!user) {
    throw Object.assign(
      new Error(
        "Something went wrong because there is no user that can be identified by that token.",
      ),
      {
        status: 500,
      },
    );
  }
  const paramId: string = req.params.id;
  try {
    const blog: Blog | null = await Blog.findByPk(paramId);
    if (!blog) {
      throw new ErrorWithCustomStatus(
        404,
        `Unable to find a blog with id ${paramId}`,
      );
    }
    if (!blog.toJSON().userId) {
      throw new Error("Cannot find a userId on blog");
    }
    const { userId: blogUserId } = blog.toJSON();
    if (blogUserId !== user.id) {
      throw Object.assign(
        new Error(
          "Cannot fulfill request because token does not belong to owner.",
        ),
        {
          status: 500,
        },
      );
    }
    const id = req.params.id;
    await Blog.destroy({ where: { id: id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
