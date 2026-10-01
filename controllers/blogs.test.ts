import supertest from "supertest";
import { describe, test, expect, beforeEach, beforeAll } from "vitest";
import app from "../app.js";
import { createUsers, createBlogs } from "../testing/factories.js";
import type {
  User,
  UserWithData,
  BlogResType,
} from "../testing/testing.types.ts";
import type { BlogReqType } from "../models/modelTypes.js";

let usersWithData: UserWithData[];
let joe: UserWithData | undefined, joey: UserWithData | undefined;
beforeAll(async () => {
  usersWithData = await createUsers();
  joe = usersWithData.filter((u) => u.name === "joe")[0];
  joey = usersWithData.filter((u) => u.name === "joey")[0];
});

describe("GET", () => {
  beforeEach(async () => {
    await createBlogs(usersWithData);
  });
  test("getting all blogs returns all blogs and their users", async () => {
    const response = await supertest(app).get("/api/blogs");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    response.body.forEach((b: BlogResType) => {
      expect(b.userId).toBeTypeOf("number");
    });
  });
});

describe.only("POST", () => {
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
  let blogId;
  beforeEach(async () => {
    const payload = {
      author: joe.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
      token: joe.token,
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
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .send({ token: joey.token });
    expect(response.status).toBe(500);
    expect(response.text).toBe(
      "Cannot fulfill request because token does not belong to owner.",
    );
  });

  test("deletion if user id is same as blog id ", async () => {
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .send({ token: joe.token });
    expect(response.status).toBe(204);
  });
});
