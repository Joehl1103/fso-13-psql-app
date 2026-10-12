import supertest from "supertest";
import { describe, test, expect, beforeEach } from "vitest";
import app from "../app";

const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

describe("LOGIN", () => {
  test("incorrect password returns 401", async () => {
    const response = await supertest(app)
      .post("/api/login")
      .set("Content-Type", "application/json")
      .send({ username: "joe@joe.com", password: "incorrect-password" });
    expect(response.status).toBe(401);
    expect(response.text).toBe("Incorrect password");
  });

  test("login returns token,username,id", async () => {
    const response = await supertest(app)
      .post("/api/login")
      .set("Content-Type", "application/json")
      .send({ username: "joe@joe.com", password: "ABcd12!&" });
    expect(response.status).toBe(200);
    const { token, username, id } = response.body;
    expect(token).toMatch(jwtRegex);
    expect(username).toBe("joe@joe.com");
    expect(id).toBeTypeOf("number");
  });
});
