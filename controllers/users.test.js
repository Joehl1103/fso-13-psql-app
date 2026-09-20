import request from "supertest";
import { describe, test, expect } from "vitest";

import app from "../app.js";

describe("POST user", () => {
  test("short password returns 500", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABCD" })
      .set("Content-Type", "application/json");

    const { error: errorMessage, status } = response.body;
    expect(status).toBe(500);
    expect(errorMessage).toBe("pw too short. Minimum 8 characters.");
  });
  test("password with correct length but incorrect criteria returns 500", async () => {
    const response = await request(app)
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
    const response = await request(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABcd12!&" })
      .set("Content-Type", "application/json");

    expect(response.statusCode).toBe(201);
    expect(response.body).toBe({ username: "joe", name: "joe" });
  });
});
