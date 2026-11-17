import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import app from "../../app.js";
import { createUsers, createBlogs } from "../../../testing/factories.js";
import {Blog} from "../../models/index.ts"
import type { UserWithData } from "../../../testing/testing.types.ts";
import type { BlogReqType, BlogResType } from "../../models/types/blog.d.ts";
import { sequelize } from "../../db/utils/db.js";
import { MIN_YEAR } from "../../util/constants.ts";
import { userNamed } from "../../../testing/testingHelpers.ts";

let usersWithData: UserWithData[];
beforeEach(async () => {
  usersWithData = await createUsers();
});

afterEach(async () => {
  await sequelize.truncate({
    cascade: true,
  });
});

describe("GET", () => {
  let blogLen: number;
  let blogs: BlogResType[];
  beforeEach(async () => {
    blogs = await createBlogs(usersWithData);
    blogLen = blogs.length;
  });
  test("getting all blogs returns all blogs and their users", async () => {
    const response = await supertest(app).get("/api/blogs");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(blogLen);
    response.body.forEach((b: BlogResType) => {
      expect(b.userId).toBeTypeOf("number");
    });
  });
  test("specifying a react substring search query should 1 blog from joe", async () => {
    const response = await supertest(app)
      .get("/api/blogs")
      .query({ search: "react" });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
  test("specifying a substring query should return two blogs, where substring appears in title of one and author in other", async () => {
    const response = await supertest(app)
      .get("/api/blogs")
      .query({ search: "josue" });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
  test("returning blogs returns them with likes in descending order", async () => {
    if (!blogs || blogs.length === 0) {
      throw new Error("no blogs");
    }
    let likeNum: number = 1;
    let likeNumArray: number[] = [];
    for (let i: number = 0; i < blogLen; i++) {
      const blog: BlogResType | undefined = blogs[i];
      if (!blog) {
        throw new Error("No blog");
      }
      const blogId: number = blog.id;
      await supertest(app)
        .patch(`/api/blogs/${blogId}`)
        .set("Content-Type", "application/json")
        .send({ likes: likeNum });
      likeNumArray.push(likeNum);
      likeNum++;
    }
    const response = await supertest(app).get("/api/blogs");
    expect(response.status).toBe(200);
    const likes: number[] = response.body.map((b: BlogResType) => b.likes);
    expect(likes).toStrictEqual(likeNumArray.reverse());
  });
});

describe("POST", () => {
  test("creating blog with token creates blog with user id", async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe');
    const payload: BlogReqType = {
      author: joe.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
    };
    const blogsResponse = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${joe.data.token}`)
      .send(payload);
    const { author, id, likes, title, url, userId } = blogsResponse.body;
    expect(id).toBeTypeOf("number");
    expect(author).toBe(joe.name);
    expect(likes).toBe(0);
    expect(title).toBe("Talkin' about my blog");
    expect(url).toBe("http://joeys-blog.com");
    expect(userId).toBeTypeOf("number");
  });

  test("no token produces error", async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe');
    const blogsResponse = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer ")
      .send({
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        token: "",
      });
    expect(blogsResponse.status).toBe(500);
    expect(blogsResponse.text).toBe("Format of Bearer token is incorrect.");
  });

  describe("year", () => {
    test("sending without year produces no error and returns year as null", async () => {
      const joe: UserWithData = userNamed(usersWithData,'joe');
      const payload: BlogReqType = {
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
      };
      const response = await supertest(app)
        .post("/api/blogs")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${joe.data.token}`)
        .send(payload);

      expect(response.status).toBe(200);
    });
    test("year < 1991 throws error", async () => {
      const joe: UserWithData = userNamed(usersWithData,'joe');
      const payload: BlogReqType = {
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        year: 1990,
      };
      const response = await supertest(app)
        .post("/api/blogs")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${joe.data.token}`)
        .send(payload);
      expect(response.status).toBe(400);
      expect(response.text).toBe(
        `Year must be greater than or equal to ${MIN_YEAR}.`,
      );
    });
    test("year with non-4 digits throws error", async () => {
      if (!joe || !joey) {
        throw Error("joe and joey are undefined");
      }
      const payload: BlogReqType = {
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        year: 199,
      };
      const response = await supertest(app)
        .post("/api/blogs")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${joe.data.token}`)
        .send(payload);
      expect(response.status).toBe(400);
      expect(response.text).toBe(
        `Year must be greater than or equal to ${MIN_YEAR}.`,
      );
    });
    test("year greater than current year fails", async () => {
      if (!joe || !joey) {
        throw Error("joe and joey are undefined");
      }
      const date: Date = new Date();
      const nextYear: number = date.getFullYear() + 1;
      const payload: BlogReqType = {
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        year: nextYear,
      };
      const response = await supertest(app)
        .post("/api/blogs")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${joe.data.token}`)
        .send(payload);
      expect(response.status).toBe(400);
      expect(response.text).toBe(
        `Year must not be greater than the current year.`,
      );
    });
    test("year with 4 digits and > 1991 is successful", async () => {
      if (!joe || !joey) {
        throw Error("joe and joey are undefined");
      }
      const payload: BlogReqType = {
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        year: 2001,
      };
      const response = await supertest(app)
        .post("/api/blogs")
        .set("Content-Type", "application/json")
        .set("Authorization", `Bearer ${joe.data.token}`)
        .send(payload);
      expect(response.status).toBe(200);
    });
  });
});

describe("DELETE", () => {
  let blogId: number;

  beforeEach(async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe');
    const payload = {
      author: joe.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
    };
    const blogCreateResponse = await Blog.create({ ...payload, likes: 0,userId: joe.data.id } )
    blogId = blogCreateResponse.toJSON().id
    // const response = await supertest(app)
    //   .post("/api/blogs")
    //   .set("Content-Type", "application/json")
    //   .set("Authorization", `Bearer ${joe.data.token}`)
    //   .send(payload);
    // ({ id: blogId } = response.body);
  });

  test("deletion fails if no token provided", async () => {
    const response = await supertest(app).delete(`/api/blogs/${blogId}`);
    expect(response.status).toBe(500);
    expect(response.text).toBe("An authorization token is required for this request.");
  });

  test("deletion fails if token belongs to different user", async () => {
    const [joe,joey]: [UserWithData,UserWithData] = [userNamed(usersWithData,'joe'),userNamed(usersWithData,'joey')];
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${joey.data.token}`);
    expect(response.status).toBe(401);
    expect(response.text).toBe(
      "Cannot fulfill request because token does not belong to owner.",
    );
  });

  test("deletion if user id is same as blog user id ", async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe')
    console.log('blogId',blogId)
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${joe.data.token}`);
    expect(response.status).toBe(204);
  });

  test("deletion fails with 404 if blog does not exist", async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe')
    const FAKE_BLOG_ID = 100
    const response = await supertest(app)
      .delete(`/api/blogs/${FAKE_BLOG_ID}`)
      .set("Content-Type", "application/json")
      .set("Authorization", `Bearer ${joe.data.token}`);
    expect(response.status).toBe(404);
    expect(response.text).toBe(`Unable to find a blog with id ${FAKE_BLOG_ID}`);
  });

  test.only('fails if session is inactive', async () => {
    
  })
});
