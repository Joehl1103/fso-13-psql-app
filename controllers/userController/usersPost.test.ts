import supertest from "supertest";
import { describe, test, expect, afterEach } from "vitest";
import type { UserRequestType } from "../../models/modelTypes.ts";
import { sequelize } from "../../util/db.js";

import app from "../../app.js";
describe("POST user", () => {
  afterEach(async () => {
    sequelize.truncate({ cascade: true });
  });
  test("username that is not email should fail", async () => {
    const response = await supertest(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABcd1234!" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Validation isEmail on username failed");
  });

  test("non-unique email should fail", async () => {
    const payload: UserRequestType = {
      username: "joe@joe.com",
      name: "joe",
      password: "ABcd1234!",
    };
    await supertest(app)
      .post("/api/users")
      .send(payload)
      .set("Content-Type", "application/json");
    const response = await supertest(app)
      .post("/api/users")
      .send(payload)
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
