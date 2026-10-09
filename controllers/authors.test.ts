import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import app from "../app.js";
import { createUsers, createBlogs } from "../testing/factories.js";
import type { UserWithData } from "../testing/testing.types.ts";
import { Blog } from "../models/index.ts";
import type { BlogReqType, BlogResType } from "../models/modelTypes.js";
import { sequelize } from "../util/db.js";

describe("GET", () => {
  beforeEach(async () => {
    const users: UserWithData[] = await createUsers();
    //TODO: 1: I need the blogs in the response to have likes, which means I have to patch them after creation
    //TODO: 2. I need to create blogs with optional likes. To do this I need to write a test for creating blogs
    await createBlogs(users);
  });
  test("getting all authors returns author,blogs,likes", async () => {
    const response = await supertest(app).get("/api/authors");
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual([
      { author: "joe", blogs: 1, likes: 3 },
      { author: "josue", blogs: 1, likes: 2 },
      { author: "joey", blogs: 1, likes: 1 },
    ]);
  });
});
