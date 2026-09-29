import { afterAll, beforeAll, beforeEach } from "vitest";
import supertest from "supertest";
import app from "./app.js";
import { sequelize } from "./util/db.js";
import path from "node:path";
const filename = path.basename(import.meta.filename);

//---
const users = [
  {
    name: "joe",
    data: { username: "joe@joe.com", name: "joe", password: "ABcd12!&" },
  },
  {
    name: "joey",
    data: { username: "joey@joey.com", name: "joey", password: "ABcd12!&" },
  },
];

let usersWithData;

const databaseName = sequelize.getDatabaseName();

if (process.env.NODE_ENV !== "test" || !databaseName.endsWith("test")) {
  throw new Error(
    `Tests refused to run against non-test database: ${databaseName}`,
  );
}

async function getToken(username, password) {
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

async function getId(username) {
  const res = await supertest(app).get("/api/users");
  const user = res.body.filter((u) => u.username === username)[0];
  return user.id;
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
  usersWithData = await Promise.all(
    users.map(async (u) => {
      const { username, password } = u.data;
      const token = await getToken(username, password);
      const id = await getId(username);
      return { ...u, data: { ...u.data, token: token, id: id } };
    }),
  );
  const joeObj = usersWithData.filter((u) => u.name === "joe")[0];
  joe = joeObj.data;
  const joeyObj = usersWithData.filter((u) => u.name === "joey")[0];
  joey = joeyObj.data;
});

beforeEach(async () => {});

afterAll(async () => {
  await sequelize.truncate({
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});
