import supertest from "supertest";
import { describe, test, expect, beforeEach, beforeAll } from "vitest";
import app from "../app.js";

//NOTE: I am having difficulty constructing the data object that I can use with all of my tests

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
let joe, joey;

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

describe("POST", () => {
  test.only("creating blog with token creates blog with user id", async () => {
    const payload = {
      author: joe.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
      token: joe.token,
    };
    const blogsResponse = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .send(payload);
    const { author, id, likes, title, url, userId } = blogsResponse.body;
    expect(id).toBeTypeOf("number");
    expect(author).toBe(joe.name);
    expect(likes).toBe(0);
    expect(title).toBe("Talkin' about my blog");
    expect(url).toBe("http://joeys-blog.com");
    expect(userId).toBe(joe.id);
  });

  test("no token produces error", async () => {
    const blogsResponse = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .send({
        author: joe.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        token: "",
      });
    expect(blogsResponse.status).toBe(500);
    expect(blogsResponse.text).toBe("No token present");
  });
});

describe("DELETE", () => {
  beforeEach(async () => {});

  test("deletion fails if user id is different same as blog id ", async () => {});

  test("deletion if user id is same as blog id ", async () => {});
});
