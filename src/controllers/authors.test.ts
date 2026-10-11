import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import app from "../app.js";
import { createUsers, createBlogs } from "../../testing/factories.js";
import type { UserWithData } from "../../testing/testing.types.ts";
import { Author } from "../models/types/author.types.ts";

describe("GET", () => {
  beforeEach(async () => {
    const users: UserWithData[] = await createUsers();
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
    const likesArr = new Array<number>();
    authors.forEach((a: Author) => {
      const { author, blogs, likes } = a;
      expect(author).toBeTypeOf("string");
      expect(likes).toBeGreaterThan(0);
      likesArr.push(likes);
      expect(blogs).toBeGreaterThan(0);
    });
    if (likesArr.length > 2) {
      let i: number = 0;
      for (i; i < likesArr.length - 2; i++) {
        const nextI: number = i + 1;
        const curr: number | undefined = likesArr[i];
        if (!curr) {
          throw new Error();
        }
        const next: number | undefined = likesArr[nextI];
        if (!next) {
          throw new Error();
        }
        expect(next).toBeLessThan(curr);
      }
    }
  });
});
