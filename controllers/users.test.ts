import supertest from "supertest";
import { describe, test, expect, beforeEach, beforeAll } from "vitest";
import { User } from "../models/index.js";
import { createUsers } from "../testing/factories.js";
import type { UserResponseType } from "../models/modelTypes.ts";
import type { UserWithData } from "../testing/testing.types.ts";

import app from "../app.js";

const timeStampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("GET users", () => {
  let usersWithData: UserWithData[];
  let joe: UserWithData | undefined, joey: UserWithData | undefined;
  beforeAll(async () => {
    usersWithData = await createUsers();
    joe = usersWithData.filter((u) => u.name === "joe")[0];
    joey = usersWithData.filter((u) => u.name === "joey")[0];
  });

  test.only("gets all users should get all users", async () => {
    // await createUsers();
    const response = await supertest(app).get("/api/users");
    expect(response.status).toBe(200);
    console.log(response.body);
    const users: UserResponseType[] = response.body;
    users.forEach((u: UserResponseType) => {
      const { id, username, name, createdAt, updatedAt } = u;
      expect(id).toBeTypeOf("number");
      expect(username).toMatch(/[A-Za-z]+\@[A-Za-z]+\.[A-Za-z]+/);
      expect(name).toBeTypeOf("string");
      expect(createdAt).toMatch(timeStampRegex);
      expect(updatedAt).toMatch(timeStampRegex);
    });
  });
});

describe("GET users by id", () => {
  test("non-existent user should return 404", async () => {
    const response = await supertest(app).get("/api/users/5");
    expect(response.status).toBe(404);
    expect(response.error.text).toBe("Unable to find user with that id.");
  });
  test("get user by id should get user by id", async () => {
    //    await createUsers();
    const response = await supertest(app).get("/api/users/1");
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      id: 1,
      username: "joe@joe.com",
      name: "joe",
      createdAt: expect.stringMatching(timeStampRegex),
      updatedAt: expect.stringMatching(timeStampRegex),
    });
  });
});
describe("POST user", () => {
  test("username that is not email should fail", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABcd1234!" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Validation isEmail on username failed");
  });

  test("non-unique email should fail", async () => {
    //    await createUsers();
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe@joe.com", name: "joe", password: "ABcd1234!" })
      .set("Content-Type", "application/json");
    expect(response.status).toBe(500);
    expect(response.text).toBe("username must be unique");
  });

  test("short password returns 500", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABCD" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.text).toBe("pw too short. Minimum 8 characters.");
  });
  test("password with correct length but incorrect criteria returns 500", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABCD1234" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.text).toBe(
      "Password must contain at least one upper case letter, one lower case letter, one number and onespecialCharacter.",
    );
  });
  test("username as email,name, correct password returns 200", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe2@joe2.com", name: "joe", password: "ABcd12!&" })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(201);
    const { id, username, name } = response.body;
    expect(id).toBeTypeOf("number");
    expect({ username, name }).toStrictEqual({
      username: "joe2@joe2.com",
      name: "joe",
    });
  });
});

describe("PUT", () => {
  //  beforeEach(async () => {
  //   await createUsers();
  //});
  test("PUT for non-existing user returns 404", async () => {
    const response = await supertest(app)
      .put("/api/users/henrietta@h.com")
      .set("Content-Type", "application/json")
      .send('{"name": "diffJoe"}');

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

describe("DELETE", () => {
  // beforeEach(async () => {
  //   await createUsers();
  // });
  test("DELETE", async () => {
    const response = await supertest(app)
      .delete("/api/users/1")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(204);

    const allRows = await supertest(app).get("/api/users");
    expect(allRows.status).toBe(200);
    const usernames = allRows.body.map((u) => u.username);
    expect(usernames).not.toContain("joe");
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
