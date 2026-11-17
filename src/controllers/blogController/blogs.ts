// packages and methods
import express from "express";
import jwt from "jsonwebtoken";
import { extractToken,requireStringParam,verifyUserFromToken } from "./../helpers.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import config from "../../util/config.ts";
import { Blog, User } from "../../models/index.ts";
import { Op } from "sequelize";
import { validateYear } from "./blogHelpers.ts"
// types
import type { JwtPayload } from "jsonwebtoken";
import type { BlogReqType, BlogResType } from "../../models/types/blog.d.ts";
import type { Request, Response } from "express";
import type { WhereOptions } from "sequelize";
import type {
  RequestParams,
  ResponseBody,
  RequestBody,
  RequestQuery,
} from "../api.js";
import type { SequelizeUpdateResult } from "../../db/utils/db.types.ts";
import type { JwtUserPayload } from "../controllers.types.general.ts";
import type { BlogPatchBody } from "./blogs.d.ts";
import type { ModelStatic } from "sequelize";

// INITIALIZATION
const router = express.Router();

const { SECRET } = config;

// ROUTER
router.get(
  "/",
  async (
    req: Request<RequestParams<['search']>, ResponseBody, RequestBody, RequestQuery<'search'>>,
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

async function verifyUserWithJwt(token: string,secret: string): Promise<User> {
    const jwtPayload = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findOne({
      where: { username: jwtPayload.username },
    });
    if (!user) {
      throw new Error(`No user found with id ${jwtPayload.id}`)
    }
  return user
}

router.post("/", extractToken, async (req, res, next) => {
  const body: BlogReqType = req.body;
  try {
    const { author, url, title, year: bodyYear } = body;
    const year: number | null = validateYear(bodyYear);
    const token: string = req.token;
  console.log('here')
    const user = await verifyUserWithJwt(token,SECRET)
    console.log('user',user)
    const payload: Omit<BlogResType, "id"> = {
      author,
      url,
      title,
      userId: user.id,
      likes: 0,
      year,
    };
    const result: Blog = await Blog.create(payload);
    res.status(200).json(result.toJSON());
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    }
  }
});

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

router.delete("/:id", extractToken, async (req, res, next) => {
  //NOTE: no body means no token since only tokens are sent
  const user: JwtUserPayload = jwt.verify(req.token, SECRET) as JwtUserPayload;
  const paramId: string = requireStringParam('id',req.params.id);
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
    verifyUserFromToken(req.token,SECRET,blogUserId.toString())
    const id = req.params.id;
    await Blog.destroy({ where: { id: id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
