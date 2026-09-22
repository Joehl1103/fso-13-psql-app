import supertest from "supertest";
import { describe, test, expect, beforeEach } from "vitest";
import { User } from "../models";

import app from "../app.js";

const users = [
  { username: "joe", name: "joe", password: "ABcd12!&" },
  { username: "joey", name: "joey", password: "ABcd12!&" },
];

const timeStampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

async function createUsers() {
  for (const user of users) {
    await User.create(user);
  }
}

describe("GET users", () => {
  test.only("gets all users should get all users", async () => {
    await createUsers();
    const response = await supertest(app).get("/api/users");
    const expectedUsers = users.map((u) => {
      const { username, name } = u;
      return { username, name };
    });
    expect(response.body).toStrictEqual(
      expectedUsers.map((u) => ({
        ...u,
        createdAt: expect.stringMatching(timeStampRegex),
        updatedAt: expect.stringMatching(timeStampRegex),
      })),
    );
  });
});

describe("GET users by id", () => {
  test("get user by id should get user by id", async () => {
    await createUsers();
    const response = await supertest(app).get("/api/users/1");
    expect(response.body).toStrictEqual({ username: "joe", name: "joe" });
  });
});
describe("POST user", () => {
  test("short password returns 500", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABCD" })
      .set("Content-Type", "application/json");

    const { error: errorMessage, status } = response.body;
    expect(status).toBe(500);
    expect(errorMessage).toBe("pw too short. Minimum 8 characters.");
  });
  test("password with correct length but incorrect criteria returns 500", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABCD1234" })
      .set("Content-Type", "application/json");

    const { error: errorMessage, status } = response.body;
    expect(status).toBe(500);
    expect(errorMessage).toBe(
      "Password must contain at least one upper case letter, one lower case letter, one number and onespecialCharacter.",
    );
  });
  test("username,name, correct password returns 200", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABcd12!&" })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(201);
    expect(response.body).toStrictEqual({ username: "joe", name: "joe" });
  });
});

describe("PUT", () => {
  beforeEach(async () => {
    await createUsers();
  });
  test("PUT for non-existing user returns 404", async () => {
    const response = await supertest(app)
      .put("/api/users/henrietta")
      .set("Content-Type", "application/json")
      .send('{"name": "diffJoe"}');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("unable to find a user by that username");
  });

  test("no body returns 400", async () => {
    const response = await supertest(app)
      .put("/api/users/joe")
      .set("Content-Type", "application/json")
      .send("{}");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("no update content");
  });

  test("PUT by username can change username or name", async () => {
    const response = await supertest(app)
      .put("/api/users/joe")
      .set("Content-Type", "application/json")
      .send('{ "name": "diffJoe" }');
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      username: "joe",
      name: "diffJoe",
    });
  });
});

describe("DELETE", () => {
  beforeEach(async () => {
    await createUsers();
  });
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
    expect(response.body.error).toStrictEqual(
      "number of destroyed rows greater than or less than expected (1): 0",
    );
  });
});
