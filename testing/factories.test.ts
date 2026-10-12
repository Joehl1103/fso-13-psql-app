import { expect, describe, test, beforeEach } from "vitest";
import { createBlogs, createUsers } from "./factories.ts";
import type { BlogResType } from "../src/models/types/blog.d.ts";
import { returnJoeAndJoey, urlRegex } from "./testingHelpers.ts";
import type { UserWithData } from "./testing.types.ts";

describe("createBlogs", () => {
  let joe: UserWithData, joey: UserWithData;
  let users: UserWithData[];
  beforeEach(async () => {
    const { joe: joeRes, joey: joeyRes } = await returnJoeAndJoey();
    joe = joeRes;
    joey = joeyRes;
    users = await createUsers();
  });
  test("createBlogs returns an array of created blogs with 0 likes", async () => {
    const blogs: BlogResType[] = await createBlogs(users);
    blogs.forEach((b) => {
      const { author, url, title, id, likes, userId } = b;
      expect(author).toBeTypeOf("string");
      expect(url).toMatch(urlRegex);
      expect(title).toBeTypeOf("string");
      expect(id).toBeTypeOf("number");
      expect(likes).toEqual(0);
      expect(userId).toBeTypeOf("number");
    });
  });
});
