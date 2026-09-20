import request from "supertest";
import { describe, test } from "vitest";

import app from "../app.js";

describe("POST user", () => {
  test("bad password returns error ", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ username: "joe", name: "joe", password: "ABCD" })
      .set("Content-Type", "application/json");

    console.log("body", response.body);
    console.log("text", response.text);
    console.log("statusCode", response.statusCode);
  });
});
