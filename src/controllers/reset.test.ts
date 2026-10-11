import { test, beforeAll, expect } from "vitest";
import { createUsers, createBlogs } from "../../testing/factories.ts";
import type { UserWithData } from "../../testing/testing.types.ts";
import supertest from "supertest";
import app from "../app.js";

let users: UserWithData[];

beforeAll(async () => {
  users = await createUsers();
  await createBlogs(users);
});

test("test empties both database tables", async () => {
  const userRes = await supertest(app).get("/api/users");
  expect(userRes.body.length).toBeGreaterThan(1);
  const blogRes = await supertest(app).get("/api/blogs");
  expect(blogRes.body.length).toBeGreaterThan(1);
  await supertest(app).get("/api/reset");
  const userRes2 = await supertest(app).get("/api/users");
  expect(userRes2.body.length).toBe(0);
  const blogRes2 = await supertest(app).get("/api/blogs");
  expect(blogRes2.body.length).toBe(0);
});
