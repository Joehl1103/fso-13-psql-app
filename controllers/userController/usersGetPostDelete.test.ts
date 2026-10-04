import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { createUsers, createBlogs } from "../../testing/factories.ts";
import type {
  UserResponseTypeFromAPI,
  BlogResType,
} from "../../models/modelTypes.ts";
import type { UserWithData } from "../../testing/testing.types.ts";
import { sequelize } from "../../util/db.js";
import { User } from "../../models/index.js";
import type { Response, Request } from "express";

import app from "../../app.js";

const timeStampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

let usersWithData: UserWithData[];
let joe: UserWithData | undefined, joey: UserWithData | undefined;
let blogs: BlogResType[];
beforeEach(async () => {
  usersWithData = await createUsers();
  joe = usersWithData.filter((u) => u.name === "joe")[0];
  if (!joe) {
    throw new Error("joe is undefined");
  }
  joey = usersWithData.filter((u) => u.name === "joey")[0];
  if (!joey) {
    throw new Error("joey is undefined");
  }
  blogs = await createBlogs(usersWithData);
  console.log("created users");
});

afterEach(async () => {
  sequelize.truncate({ cascade: true });
  console.log("deleted all tables");
});

describe("GET users", () => {
  test("gets all users should get all users", async () => {
    const response = await supertest(app).get("/api/users");
    expect(response.status).toBe(200);
    const users: UserResponseTypeFromAPI[] = response.body;
    users.forEach((u: UserResponseTypeFromAPI) => {
      const { id, username, name, createdAt, updatedAt, blogs } = u;
      expect(id).toBeTypeOf("number");
      expect(username).toMatch(/[A-Za-z]+\@[A-Za-z]+\.[A-Za-z]+/);
      expect(name).toBeTypeOf("string");
      expect(createdAt).toMatch(timeStampRegex);
      expect(updatedAt).toMatch(timeStampRegex);
      expect(blogs).toBeTruthy();
    });
  });
});

describe("GET users by id", () => {
  test("non-existent user should return 404", async () => {
    const response = await supertest(app).get("/api/users/5");
    expect(response.status).toBe(404);
    if (response.error instanceof Error) {
      expect(response.error.text).toBe("Unable to find user with that id.");
    } else {
    }
  });
  test("get user by id should get user by id", async () => {
    if (!joe) {
      throw new Error("joe is undefined");
    }
    const response = await supertest(app).get(`/api/users/${joe.data.id}`);
    expect(response.status).toBe(200);
    const joesBlogIds: number[] = [];
    blogs.forEach((b: BlogResType) => {
      if (joe && b.userId === joe.data.id) {
        joesBlogIds.push(b.id);
      }
    });
    expect(response.body).toStrictEqual({
      id: joe.data.id,
      username: `${joe.data.username}`,
      name: `${joe.data.name}`,
      createdAt: expect.stringMatching(timeStampRegex),
      updatedAt: expect.stringMatching(timeStampRegex),
      blogs: joesBlogIds,
    });
  });
});
describe("PUT", () => {
  test("PUT for non-existing user returns 404", async () => {
    const response = await supertest(app)
      .put("/api/users/henrietta@h.com")
      .set("Content-Type", "application/json")
      .send({ name: "diffJoe" });

    expect(response.status).toBe(404);
    expect(response.text).toBe("unable to find a user by that username");
  });

  test("no body returns 400", async () => {
    const response = await supertest(app)
      .put("/api/users/joe@joe.com")
      .set("Content-Type", "application/json")
      .send("{}");
    expect(response.status).toBe(400);
    expect(response.text).toBe("no update content");
  });

  test("PUT by username can change username or name", async () => {
    const response = await supertest(app)
      .put("/api/users/joe@joe.com")
      .set("Content-Type", "application/json")
      .send('{ "name": "diffJoe" }');
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      username: "joe@joe.com",
      name: "diffJoe",
    });
  });
});

describe.only("DELETE", () => {
  test.only("DELETE returns 204 and user is no longer available", async () => {
    if (!joe) {
      throw new Error("joe is undefined");
    }
    console.log("joe.data.id", joe.data.id);
    const response = await supertest(app)
      .delete(`/api/users/${joe.data.id}`)
      .set("Content-Type", "application/json");
    console.log("response.body", response.body);
    expect(response.status).toBe(204);
    expect(response.body).toStrictEqual({});
    const allRows = await supertest(app).get("/api/users");
    console.log("allRows", allRows.body);
    expect(allRows.status).toBe(200);
    const usernames: string[] = allRows.body.map((u: User) => u.username);
    expect(usernames).not.toContain(joe.name);
  });
  test("DELETE non-existing id returns 500", async () => {
    const response = await supertest(app)
      .delete("/api/users/3")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.text).toStrictEqual(
      "number of destroyed rows greater than or less than expected (1): 0",
    );
  });
});
