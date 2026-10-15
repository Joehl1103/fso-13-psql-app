import { afterAll, beforeAll } from "vitest";
import { sequelize } from "./db/utils/db.ts";
import path from "node:path";
import { Blog } from "./src/models/index.ts";
import { umzug } from "./db/utils/umzug.ts";

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
  console.log(`${filename} || Running any migrations`);
  const migrations = await umzug.up();
  console.log("Migrations up to date", {
    files: migrations.map((mig) => mig.name),
  });
  const description = await Blog.describe();
  console.log("blog description", description);
});

afterAll(async () => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});
