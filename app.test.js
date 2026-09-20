import { describe, expect, test } from "vitest";

import app from "./app.js";

describe("application module", () => {
  test("exports the Express request handler as an ES module default", () => {
    expect(typeof app).toBe("function");
  });
});
