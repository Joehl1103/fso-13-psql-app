import { afterAll, beforeAll } from "vitest";
import { sequelize } from "./src/db/utils/db.ts";
import path from "node:path";
import { Blog } from "./src/models/index.ts";
import { syncModels } from "./src/models/index.ts";

const filename: string = path.basename(import.meta.filename);

const databaseName: string = sequelize.getDatabaseName();

if (process.env.NODE_ENV !== "test" || !databaseName.endsWith("test")) {
  throw new Error(
    `Tests refused to run against non-test database: ${databaseName}`,
  );
}

beforeAll(async () => {
  await syncModels();
  console.log(`${filename} || Authenticating test database ${databaseName}.`);
  await sequelize.authenticate();
  console.log(`${filename} || Test database '${databaseName}' authenticated.`);
});

afterAll(async () => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});
