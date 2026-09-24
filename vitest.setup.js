import { afterAll, beforeAll, beforeEach } from "vitest";
import supertest from "supertest";
import app from "./app.js";
import { sequelize } from "./util/db.js";

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
