import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    setupFiles: "./vitest.setup.js",
    hookTimeout: 50000,
  },
});
