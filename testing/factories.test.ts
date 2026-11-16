import { expect, describe, test, beforeAll } from "vitest";
import { createBlogs, createUsers } from "./factories.ts";
import type { BlogResType } from "../src/models/types/blog.d.ts";
import { returnJoeAndJoey, urlRegex } from "./testingHelpers.ts";
import type { UserWithData } from "./testing.types.ts";
import { jwtRegex } from "./constants.ts";

let users: UserWithData[];

beforeAll(async () => {
  users = await createUsers();
})

describe("createBlogs", () => {
  test("createBlogs returns an array of created blogs with 0 likes", async () => {
    const blogs: BlogResType[] = await createBlogs(users);
    blogs.forEach((b) => {
      expect(b).toStrictEqual({
        author: expect.any(String),
        url: expect.stringMatching(urlRegex),
        title: expect.any(String),
        id: expect.any(Number),
        likes: 0,
        userId: expect.any(Number),
        year: null
        })
      });
    });
  });

  test("createUsers", async () => {
    expect(users.length).toBeGreaterThan(0);
    users.forEach((u: UserWithData) => {
      expect(u).toStrictEqual({
      name: expect.any(String),
      data: {
        username:expect.any(String),
        name: expect.any(String),
        password: expect.any(String),
        token: expect.stringMatching(jwtRegex),
        blogs: expect.any(Array),
        id: expect.any(Number),
      }
    })
  });
});
