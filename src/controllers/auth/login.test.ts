import supertest from "supertest";
import { describe, test, expect, beforeAll } from "vitest";
import app from "../../app.js";
import { createUsers } from "../../../testing/factories.ts";
import { jwtRegex } from "../../../testing/constants.ts";


beforeAll(async () => {
  await createUsers()
})

describe("LOGIN", () => {
  test("incorrect password returns 401", async () => {
    const response = await supertest(app)
      .post("/api/login")
      .set("Content-Type", "application/json")
      .send({ username: "joe@joe.com", password: "incorrect-password" });
    expect(response.status).toBe(401);
    expect(response.text).toBe("Incorrect password");
  });

  test("login returns token,username,id, and session id", async () => {
    const response = await supertest(app)
      .post("/api/login")
      .set("Content-Type", "application/json")
      .send({ username: "joe@joe.com", password: "ABcd12!&" });
    expect(response.status).toBe(200);
    const { token, username, id, sessionId } = response.body;
    expect(token).toMatch(jwtRegex);
    expect(username).toBe("joe@joe.com");
    expect(id).toBeTruthy();
    expect(sessionId).toBeTypeOf('number')
  });
})
