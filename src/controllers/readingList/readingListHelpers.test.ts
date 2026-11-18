import { test, expect, describe, beforeAll } from "vitest";
import { checkForReadingListExistence } from "./readingListHelpers.ts";
import type { UserWithData } from "../../../testing/testing.types.ts";  
import { ReadingList } from "../../models/index.ts";
import { createBlogs, createUsers } from "../../../testing/factories.ts";

describe('checking for reading list existence', () => {

  beforeAll(async () => {
    const users: UserWithData[] = await createUsers();
    await createBlogs(users);
    await ReadingList.create({ userId: 1, blogId: 1, read: false});
  })

  test('should return true if already exists', async () => {
    const exists: boolean = await checkForReadingListExistence(1,1);
    expect(exists).toBe(true);
  })

  test('should return false if does not exists', async () => {
    const exists: boolean = await checkForReadingListExistence(1,100);
    expect(exists).toBe(false);
  })

  test('throws error if user id is not found', async () => {

    const exists: boolean = await checkForReadingListExistence(1000,1);
    expect(exists).toBe(false);
  })
})
