import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import app from "../app.js";
import { createUsers, createBlogs } from "../testing/factories.js";
import type { UserWithData } from "../testing/testing.types.ts";
import { Author } from "./authors.ts";

describe("GET", () => {
  beforeEach(async () => {
    const users: UserWithData[] = await createUsers();
    //TODO: 1: I need the blogs in the response to have likes, which means I have to patch them after creation
    //TODO: 2. I need to create blogs with optional likes. To do this I need to write a test for creating blogs
    const blogs = await createBlogs(users);
    let likeInt: number = 1;
    for await (const blog of blogs) {
      const { id } = blog;
      await supertest(app)
        .patch(`/api/blogs/${id}`)
        .set("Content-Type", "application/json")
        .send({ likes: likeInt });
      likeInt++;
    }
  });
  test("getting all authors returns author,blogs,likes", async () => {
    const response = await supertest(app).get("/api/authors");
    expect(response.status).toBe(200);
    const authors: Author[] = response.body;
    authors.forEach((a: Author) => {
      const { author, blogs, likes } = a;
      expect(author).toBeTypeOf("string");
      expect(likes).toBeGreaterThan(0);
      expect(blogs).toBeGreaterThan(0);
    });
  });
});
