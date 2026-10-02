import type { UserWithData, User } from "./testing.types.ts";
import supertest from "supertest";
import app from "../app.js";
import type {
  UserRequestType,
  BlogType,
  UserResponseTypeFromSequelize,
} from "../models/modelTypes.js";

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
  console.group("createUsers");
  console.log("A");
  await Promise.all(
    userSource.map(async (u: UserWithData, i: number) => {
      const { username, name, password } = u.data;
      const payload: UserRequestType = {
        username: username,
        name: name,
        password: password,
      };
      console.log(`${i} A.1`);
      const res = await supertest(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send(payload);
      // const res.body: UserResponseTypeFromSequelize
    }),
  );
  const users = await supertest(app).get("/api/users");
  console.log("users", users);
  console.log("B");
  const usersWithTokensAndData = await Promise.all(
    userSource.map(async (u: UserWithData) => {
      const token = await getToken(u.data.username, u.data.password);
      const id = await getId(u.data.username);
      return { ...u, data: { ...u.data, token: token, id: id } };
    }),
  );
  console.groupEnd();
  return usersWithTokensAndData;
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
