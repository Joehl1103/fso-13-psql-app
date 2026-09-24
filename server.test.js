import { describe, test, expect } from "vitest";
import net from "node:net";

import { listen } from "./server.js";
import app from "./app.js";

describe("start", () => {
  test("increments port when requested is already in use", async () => {
    const blocker = net.createServer();

    await new Promise((resolve) => {
      blocker.listen(0, resolve);
    });

    const occupiedPort = blocker.address().port;
    const server = await listen(app, occupiedPort + 1);

    expect(server.address().port).toBe(occupiedPort + 1);

    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => blocker.close(resolve));
  });
});
