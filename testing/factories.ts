import type { UserWithData, User } from "./testing.types.ts";
import supertest from "supertest";
import app from "../app.js";
import type { UserRequestType, BlogType } from "../models/modelTypes.js";

const user: UserWithData = {
  name: "",
  data: { username: "", name: "", password: "", token: "", blogs: [], id: 0 },
};

const data = [
  { name: "joe", username: "joe@joe.com", password: "ABcd12!&" },
  { name: "joey", username: "joey@joey.com", password: "ABcd12!&" },
];
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

async function getId(username: string): Promise<number> {
  const res = await supertest(app).get("/api/users");
  const user = res.body.filter((u: User) => u.username === username)[0];
  return user.id;
}

function generateUser(
  username: string,
  name: string,
  password: string,
): UserWithData {
  return {
    name: name,
    data: { ...user.data, username: username, name: name, password: password },
  };
}
const userSource: UserWithData[] = data.map((u) =>
  generateUser(u.username, u.name, u.password),
);

async function createUsers(): Promise<UserWithData[]> {
  return await Promise.all(
    userSource.map(async (u: UserWithData) => {
      const { username, name, password } = u.data;
      const payload: UserRequestType = {
        username: username,
        name: name,
        password: password,
      };
      await supertest(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send(payload);
      const token = await getToken(username, password);
      const id = await getId(username);
      return { ...u, data: { ...u.data, token: token, id: id } };
    }),
  );
}

async function createBlogs(users: UserWithData[]): Promise<BlogType[]> {
  const joe = users.filter((u) => u.name === "joe")[0];
  const joey = users.filter((u) => u.name === "joey")[0];
  if (!joe || !joey) {
    throw new Error("Joe or joey is undefined, or both");
  }
  const blogPayload = [
    {
      author: "joe",
      url: "http://joes-blog.com",
      title: "Talkin' about my blog",
      token: joe.data.token,
    },
    {
      author: joey.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
      token: joey.data.token,
    },
  ];
  return await Promise.all(
    blogPayload.map(async (b) => {
      const res = await supertest(app)
        .post("/api/blogs")
        .set("Content-Type", "application/json")
        .send(b);
      return res.body;
    }),
  );
}

export { createUsers, createBlogs };
