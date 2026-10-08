import { describe, test, beforeEach } from "vitest";
import { createBlogs, createUsers } from "./factories.ts";
import type { BlogResType } from "../models/modelTypes.ts";
import { returnJoeAndJoey } from "./testingHelpers.ts";
import type { UserWithData } from "./testing.types.ts";

describe("createBlogs", () => {
  let joe: UserWithData, joey: UserWithData;
  beforeEach(async () => {
    const { joe: joeRes, joey: joeyRes } = await returnJoeAndJoey();
    joe = joeRes;
    joey = joeyRes;
    const users: UserWithData[] = await createUsers();
  });
  test("createBlogs returns an array of created blogs", async () => {
    const blogs: BlogResType[] = await createBlogs(users);
  });
});
