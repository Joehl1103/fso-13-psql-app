import supertest from "supertest";
import { describe, test, expect } from "vitest";
import { User } from "../models";

import app from "../app.js";

describe("GET users", () => {
  test.only("gets all users should get all users", async () => {
    const users = [
      { username: "joe", name: "joe", password: "ABcd12!&" },
      { username: "joey", name: "joey", password: "ABcd12!&" },
    ];
    for (const user of users) {
      await User.create(user);
    }
    const response = await supertest(app).get("/api/users");
    const expectedUsers = users.map((u) => {
      const { username, name } = u;
      return { username, name };
    });
    expect(response.body).toStrictEqual(expectedUsers);
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
