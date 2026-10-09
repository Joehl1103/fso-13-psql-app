import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import app from "../app.js";
import { createUsers, createBlogs } from "../testing/factories.js";
import type { UserWithData } from "../testing/testing.types.ts";
import type { BlogReqType, BlogResType } from "../models/types/blog.d.ts";
import { sequelize } from "../util/db.js";

let usersWithData: UserWithData[];
let joe: UserWithData | undefined, joey: UserWithData | undefined;
beforeEach(async () => {
  usersWithData = await createUsers();
  joe = usersWithData.filter((u) => u.name === "joe")[0];
  joey = usersWithData.filter((u) => u.name === "joey")[0];
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
  test.only("returning blogs returns them with likes in descending order", async () => {
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
    if (!joe || !joey) {
      throw Error("joe and joey are undefined");
    }
    const payload: BlogReqType = {
      author: joe.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
      token: joe.data.token,
    };
    const blogsResponse = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
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
    if (!joe) {
      throw new Error("Joe is undefined");
    }
    const blogsResponse = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .send({
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        token: "",
      });
    expect(blogsResponse.status).toBe(500);
    expect(blogsResponse.text).toBe("No token present");
  });
});

describe("DELETE", () => {
  let blogId: number;

  beforeEach(async () => {
    if (!joe) {
      throw new Error("Joe is undefined");
    }
    const payload = {
      author: joe.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
      token: joe.data.token,
    };
    const response = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .send(payload);
    ({ id: blogId } = response.body);
  });

  test("deletion fails if no token provided", async () => {
    const response = await supertest(app).delete(`/api/blogs/${blogId}`);
    expect(response.status).toBe(500);
    expect(response.text).toBe("No token provided");
  });

  test("deletion fails if token belongs to different user", async () => {
    if (!joey) {
      throw new Error("Joey is undefined");
    }
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .send({ token: joey.data.token });
    expect(response.status).toBe(500);
    expect(response.text).toBe(
      "Cannot fulfill request because token does not belong to owner.",
    );
  });

  test("deletion if user id is same as blog id ", async () => {
    if (!joe) {
      throw new Error("Joe is undefined");
    }
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .send({ token: joe.data.token });
    expect(response.status).toBe(204);
  });

  test("deletion fails with 404 if userId does not exist", async () => {
    if (!joe) {
      throw new Error("Joe is undefined");
    }
    const response = await supertest(app)
      .delete(`/api/blogs/100`)
      .set("Content-Type", "application/json")
      .send({ token: joe.data.token });
    expect(response.status).toBe(404);
    expect(response.text).toBe("Unable to find a blog with id 100");
  });
});
