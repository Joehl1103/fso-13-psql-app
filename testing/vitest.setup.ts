import { afterAll, beforeAll } from "vitest";
import { sequelize } from "../db/utils/db.ts";
import path from "node:path";
const filename: string = path.basename(import.meta.filename);

const databaseName: string = sequelize.getDatabaseName();

if (process.env.NODE_ENV !== "test" || !databaseName.endsWith("test")) {
  throw new Error(
    `Tests refused to run against non-test database: ${databaseName}`,
  );
}

beforeAll(async () => {
  console.log(`${filename} || Authenticating test database ${databaseName}.`);
  await sequelize.authenticate();
  console.log(`${filename} || Test database '${databaseName}' authenticated.`);
  console.log(`${filename} || Syncing TEST models.`);
  await sequelize.sync({
    force: true,
    match: /_test$/,
  });
  console.log(`${filename} || TEST models synced.`);
});

afterAll(async () => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});
