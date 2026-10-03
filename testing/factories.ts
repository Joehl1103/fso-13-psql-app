import type { UserWithData, User } from "./testing.types.ts";
import supertest from "supertest";
import app from "../app.js";
import type {
  UserRequestType,
  BlogResType,
  UserResponseTypeFromSequelize,
  UserPOSTResponseTypeFromAPI,
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
  const usersWithId: UserWithData[] = await Promise.all(
    userSource.map(async (u: UserWithData, i: number) => {
      const { username, name, password } = u.data;
      const payload: UserRequestType = {
        username: username,
        name: name,
        password: password,
      };
      const res = await supertest(app)
        .post("/api/users")
        .set("Content-Type", "application/json")
        .send(payload);
      const createdUser: UserPOSTResponseTypeFromAPI = res.body;
      console.log("res.body", res.body);
      const { id } = res.body;
      console.log("id in createUsers", id);
      return { ...u, data: { ...u.data, id: id } };
    }),
  );
  console.log("usersWithId", usersWithId);
  const usersWithTokensAndData = await Promise.all(
    usersWithId.map(async (u: UserWithData) => {
      const token = await getToken(u.data.username, u.data.password);
      return { ...u, data: { ...u.data, token: token } };
    }),
  );
  console.log("usersWithTokensAndData", usersWithTokensAndData);
  return usersWithTokensAndData;
}

async function createBlogs(users: UserWithData[]): Promise<BlogResType[]> {
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
