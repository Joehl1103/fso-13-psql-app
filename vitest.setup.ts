import { afterAll, beforeAll, beforeEach } from "vitest";
import supertest from "supertest";
import app from "./app.js";
import { sequelize } from "./util/db.js";
import path from "node:path";
const filename: string = path.basename(import.meta.filename);

const databaseName: string = sequelize.getDatabaseName();

if (process.env.NODE_ENV !== "test" || !databaseName.endsWith("test")) {
  throw new Error(
    `Tests refused to run against non-test database: ${databaseName}`,
  );
}

async function getToken(username: string, password: string): Promise<string> {
  const payload = {
    username: username,
    password: password,
  };
  const res = await supertest(app)
    .post("/api/login")
    .set("Content-Type", "application/json")
    .send(payload);
  return res.body.token;
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
  await sequelize.close();
});
