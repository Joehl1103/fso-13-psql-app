import { afterAll, beforeAll, beforeEach } from "vitest";
import { DATABASE_URL } from "./util/config";
import { sequelize } from "./util/db";
import "./models/index.js";
import supertest from "supertest";
import app from "./app.js";
import Sequelize from "sequelize";
import { DATABASE_URL } from "./util/config.js";

const databaseOptions = {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 2,
    min: 0,
    idle: 10000,
  },
};

const sequelize = new Sequelize(DATABASE_URL, databaseOptions);

const databaseName = new URL(DATABASE_URL).pathname.slice(1);

export const users = [
  { username: "joe@joe.com", name: "joe", password: "ABcd12!&" },
  { username: "joey@joey.com", name: "joey", password: "ABcd12!&" },
];

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
  try {
    await supertest(app)
      .post("/api/users")
      .set("Content-Type", "application/json")
      .send(users[0]);
    await supertest(app)
      .post("/api/users")
      .set("Content-Type", "application/json")
      .send(users[1]);
    await supertest(app)
      .post("/api/login")
      .set("Content-Type", "application/json")
      .send();
  } catch (error) {
    console.error(error);
  }
});

afterAll(async () => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});
