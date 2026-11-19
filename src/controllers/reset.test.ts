import { test, beforeAll, expect } from "vitest";
import { createUsers, createBlogs } from "../../testing/factories.ts";
import type { UserWithData } from "../../testing/testing.types.ts";
import { Session, ReadingList, User, Blog } from "../models/index.ts";
import supertest from "supertest";
import app from "../app.js";
import type { Model, ModelStatic } from "sequelize";

let users: UserWithData[];

beforeAll(async () => {
  users = await createUsers();
  await createBlogs(users);
  await ReadingList.create({ blogId: 1, userId: 1, read: false });
  await Session.create({ userId: 1, token: "TOKEN" });
});

async function findAllForModel(model: ModelStatic<any>): Promise<ModelStatic<any>[]> {
  return await model.findAll();
}

test("test empties both database tables", async () => {
  const modelList: ModelStatic<any>[] = [User,Blog,ReadingList,Session] 
  for (const model of modelList){
    const res: ModelStatic<any>[] = await findAllForModel(model);
    expect(res.length).toBeGreaterThan(0);
  }
  await supertest(app).post("/api/reset");
  for (const model of modelList){
    const res: ModelStatic<any>[] = await findAllForModel(model);
    expect(res.length).toBe(0);
  }
});
