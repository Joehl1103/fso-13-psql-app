import { afterAll, beforeAll, beforeEach } from "vitest";

import { DATABASE_URL } from "./util/config";
import { sequelize } from "./util/db";
import "./models/index.js";

const databaseName = new URL(DATABASE_URL).pathname.slice(1);

if (!databaseName.endsWith("test")) {
  throw new Error(
    `Tests refused to run against non-test database: ${databaseName}`,
  );
}

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({
    force: true,
    match: /_test$/,
  });
});

beforeEach(async () => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });
});

afterAll(async () => {
  await sequelize.close();
});
