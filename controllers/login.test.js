import supertest from "supertest";
import { describe, test, expect, beforeEach } from "vitest";
import app from "../app";

const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

describe("LOGIN", () => {
  test("login returns login", async () => {
    const response = await supertest(app)
      .post("/api/login")
      .set("Content-Type", "application/json")
      .send("{ username: 'joe@joe.com', password: 'ABcd12!&' }");
    expect(response.status).toBe(200);
    const { token, username, name } = response.body;
    expect(token).toMatch(jwtRegex);
    expect(username).toBe("joe@joe.com");
    expect(name).toBe("joe");
  });
});
