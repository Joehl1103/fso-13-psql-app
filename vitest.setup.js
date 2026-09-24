import { afterAll, beforeAll, beforeEach } from "vitest";
import supertest from "supertest";
import app from "./app.js";
import { sequelize } from "./util/db.js";
import path from "node:path";
const filename = path.basename(import.meta.filename);

export const users = [
  { username: "joe@joe.com", name: "joe", password: "ABcd12!&" },
  { username: "joey@joey.com", name: "joey", password: "ABcd12!&" },
];

const databaseName = sequelize.getDatabaseName();

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

beforeEach(async () => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });

  for (const user of users) {
    await supertest(app)
      .post("/api/users")
      .set("Content-Type", "application/json")
      .send(user);
  }
});

afterAll(async () => {
  await sequelize.close();
});
