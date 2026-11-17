import supertest from "supertest";
import app from "../../app.js";
import { describe, test, expect, beforeAll, beforeEach } from "vitest";
import { createUsers, createBlogs } from "../../../testing/factories.ts";
import type {
  ReadingListReqBody,
  ReadingListResBody,
  ReadingListRawPayload
} from "./readingList.api.types.ts";
import type { UserWithData } from "../../../testing/testing.types.ts";
import type { BlogResType } from "../../models/types/blog.js";
import { ReadingList } from "../../models/index.ts"
import type { InferAttributes } from "sequelize";

let joe: UserWithData, joey: UserWithData;
let blogs: BlogResType[];
let blogIds: number[];



beforeAll(async () => {
  const users: UserWithData[] = await createUsers();
  const joeRes = users.find((u: UserWithData) => u.name === "joe");
  if (!joeRes) {
    throw new Error("joe is missing.");
  }
  joe = joeRes;
  const joeyRes = users.find((u: UserWithData) => u.name == 'joey')
  if(!joeyRes){
    throw new Error("joey is missing")
  }
  joey = joeyRes
  blogs = await createBlogs(users);
  const blogIdsRaw: number[] | undefined[] = blogs.map(
    (b: BlogResType) => b.id,
  );
  if (!blogIdsRaw || blogIdsRaw.length === 0) {
    throw new Error("blogIds is empty");
  }
  blogIds = blogIdsRaw;
});

describe("POST", () => {
  test("post normal", async () => {
    const firstBlogIdRaw: number | undefined = blogIds[0];
    if (!firstBlogIdRaw) {
      throw new Error("no first blog id");
    }
    const firstBlogId: number = firstBlogIdRaw;
    const payload: ReadingListRawPayload = {
      blogId: firstBlogId,
      userId: joe.data.id,
    };
    const res = await supertest(app)
      .post("/api/readingList")
      .set("Content-Type", "application/json")
      .send(payload);
    expect(res.status).toBe(200);
    const resBody: ReadingListResBody = res.body;
    const { id, blogId, userId, read } = resBody;
    expect(id).toBeTypeOf("number");
    expect(blogId).toBe(firstBlogId);
    expect(userId).toBe(joe.data.id);
    expect(read).toBe(false);
  });

  test('no body returns 400', async () => {
    const payloads = ["",{}]  
    for (const pl of payloads) {
      const res = await supertest(app)
        .post('/api/readingList')
        .set("Content-Type","application/json")
        .send(pl)
      expect(res.status).toBe(400)
    };
  });

  test('body with no user id or blog id fails', async () => {
    const payloads = [{blogId: "",userId: 3},{blogId: 5,userId: ""}]
    for (const pl of payloads){
      const res = await supertest(app)
        .post('/api/readingList')
        .set("Content-Type","application/json")
        .send(pl)
      expect(res.status).toBe(400)
    }
  })

	test('post invalid user id returns error', async () => {
    const payload: ReadingListRawPayload = {
      blogId: 1,
      userId: 500,
    };
    const res = await supertest(app)
      .post("/api/readingList")
      .set("Content-Type", "application/json")
      .send(payload);
    expect(res.status).toBe(400);
	});

  test('post invalid blog id returns error',async() => {
     const payload: ReadingListRawPayload = {
      blogId: 100,
      userId: 1,
    };
    const res = await supertest(app)
      .post("/api/readingList")
      .set("Content-Type", "application/json")
      .send(payload);
    expect(res.status).toBe(400);

  });
});

describe("PUT", () => {

  let entry: InferAttributes<ReadingList>;

  beforeEach(async () => {
    const res = await ReadingList.create({userId: joe.data.id,blogId: 1})
    entry = res.toJSON()
  })

  test("put request with opposite boolean changes read state", async () => {
    const res = await supertest(app)
      .put(`/api/readingList/${entry.id}`)
      .set("Content-Type","application/json")
      .set("Authorization", `Bearer ${joe.data.token}`)
    expect(res.status).toBe(200)
    expect(res.body.read).toBe(!entry.read)
  })

  test("request fails if entry does not belong to user", async () => {
    const res = await supertest(app)
      .put(`/api/readingList/${entry.id}`)
      .set("Content-Type","application/json")
      .set("Authorization", `Bearer ${joey.data.token}`)
    expect(res.status).toBe(401)
  })
})
