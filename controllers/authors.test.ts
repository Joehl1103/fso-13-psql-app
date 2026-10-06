import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import app from "../app.js";
import { createUsers, createBlogs } from "../testing/factories.js";
import type { UserWithData } from "../testing/testing.types.ts";
import type { BlogReqType, BlogResType } from "../models/modelTypes.js";
import { sequelize } from "../util/db.js";

describe("GET", () => {
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
