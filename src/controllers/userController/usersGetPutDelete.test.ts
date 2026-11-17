import supertest from "supertest";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { createUsers, createBlogs } from "../../../testing/factories.ts";
import type { 
  BlogResType,
  BlogResTypeMinusUserId,
  BlogWithReadingProps,
  BlogResReadingList
} from "../../models/types/blog.js";
import type { UserResponseTypeFromAPI, UserWithAssociations } from "../../models/types/user.js";
import type { UserWithData } from "../../../testing/testing.types.ts";
import { sequelize } from "../../db/utils/db.ts";
import { User,ReadingList,Blog,Session } from "../../models/index.ts";
import type {InferAttributes} from "sequelize"
import { userNamed } from "../../../testing/testingHelpers.ts";

import app from "../../app.js";

const timeStampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const urlRegex = /^https?\:\/\/(www.)?[a-zA-Z0-9-\.]*\.[a-z]{3}$/
const usernameRegex = /[A-Za-z]+\@[A-Za-z]+\.[A-Za-z]+/

let usersWithData: UserWithData[];
let blogs: BlogResType[];
beforeEach(async () => {
  usersWithData = await createUsers();
  const [joe,joey,johnny]: [UserWithData,UserWithData,UserWithData] = [userNamed(usersWithData,'joe'),userNamed(usersWithData,'joey'),userNamed(usersWithData,'johnny')]
  blogs = await createBlogs(usersWithData);
  if(!blogs[0] || !blogs[1] || !blogs[2]){
    throw new Error('blogs are undefined');
  }
  const readingListPayload = [
    {
      blogId: Number(blogs[0].id),
      userId: Number(joe.data.id),
      read: false
    },
    {
      blogId: Number(blogs[1].id),
      userId: Number(joe.data.id),
      read: false
    },
    {
      blogId: Number(blogs[2].id),
      userId: Number(joey.data.id),
      read: false
    }
  ]
  for (const readingList of readingListPayload){
    await ReadingList.create(readingList)
  }
});

afterEach(async () => {
  sequelize.truncate({ cascade: true });
});

describe("GET users", () => {
  test("gets all users should get all users", async () => {
    const response = await supertest(app).get("/api/users");
    expect(response.status).toBe(200);
    const users: UserResponseTypeFromAPI[] = response.body;
    users.forEach((u: UserResponseTypeFromAPI) => {
      const { id, username, name, createdAt, updatedAt, blogs } = u;
      expect(id).toBeTypeOf("number");
      expect(username).toMatch(usernameRegex);
      expect(name).toBeTypeOf("string");
      expect(createdAt).toMatch(timeStampRegex);
      expect(updatedAt).toMatch(timeStampRegex);
      expect(blogs).toBeTruthy();
    });
  });
});

describe("GET users by id", () => {
  test("non-existent user should return 404", async () => {
    const response = await supertest(app).get("/api/users/100");
    expect(response.status).toBe(404);
    if (response.error instanceof Error) {
      expect(response.error.text).toBe("Unable to find user with that id.");
    } else {
    }
  });
  test("get user by id should get user by id with their reading list", async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe');
    const response = await supertest(app).get(`/api/users/${joe.data.id}`);
    expect(response.status).toBe(200);
    const joesBlogIds: number[] = [];
    blogs.forEach((b: BlogResType) => {
      if (joe && b.userId === joe.data.id) {
        joesBlogIds.push(b.id);
      }
    });

    function expectedBlog(): BlogResTypeMinusUserId {
      return {
        id: expect.any(Number),
        url: expect.stringMatching(urlRegex),
        title: expect.any(String),
        author: expect.any(String),
        likes: expect.any(Number),
        year: null
      }
    }

    function expectedReading(): BlogWithReadingProps {
      const blog: BlogResTypeMinusUserId = expectedBlog() 
      return {
        ...blog,
        reading_list: {
          id: expect.any(Number),
          read: expect.any(Boolean)
        }
      }
    }

    expect(response.body).toStrictEqual({
      id: joe.data.id,
      username: `${joe.data.username}`,
      name: `${joe.data.name}`,
      createdAt: expect.stringMatching(timeStampRegex),
      updatedAt: expect.stringMatching(timeStampRegex),
      blogs: [expectedBlog(),expectedBlog()],
      readings: [expectedReading(),expectedReading()]
    });
  });
  test("user without blogs should return empty blogs", async () => {
    const johnny: UserWithData = userNamed(usersWithData,'johnny')
    const response = await supertest(app).get(`/api/users/${johnny.data.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      id: johnny.data.id,
      username: `${johnny.data.username}`,
      name: `${johnny.data.name}`,
      createdAt: expect.stringMatching(timeStampRegex),
      updatedAt: expect.stringMatching(timeStampRegex),
      blogs: [],
      readings: []
    });
  });

  test('getting users with reading list params should return only bool value of read', async() => {
    const joe: UserWithData = userNamed(usersWithData,'joe');
    for(const bool in [true,false]){
      const res = await supertest(app)
              .get(`/api/users/${joe.data.id}`)
              .query({ read: true })
      expect(res.status).toBe(200)
      const readingList: BlogResReadingList[] = res.body.readings.map(
        (r: BlogWithReadingProps ): BlogResReadingList  => {
        return r.reading_list
      })
      readingList.forEach(rl => expect(rl.read).toBe(bool))
    }
  })
})
describe("PUT", () => {
  test("PUT for non-existing user returns 404", async () => {
    const response = await supertest(app)
      .put("/api/users/henrietta@h.com")
      .set("Content-Type", "application/json")
      .send({ name: "diffJoe" });

    expect(response.status).toBe(404);
    expect(response.text).toBe("unable to find a user by that username");
  });

  test("no body returns 400", async () => {
    const response = await supertest(app)
      .put("/api/users/joe@joe.com")
      .set("Content-Type", "application/json")
      .send("{}");
    expect(response.status).toBe(400);
    expect(response.text).toBe("no update content");
  });

  test("PUT by username can change username or name", async () => {
    const response = await supertest(app)
      .put("/api/users/joe@joe.com")
      .set("Content-Type", "application/json")
      .send('{ "name": "diffJoe" }');
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      username: "joe@joe.com",
      name: "diffJoe",
    });
  });
});

describe("DELETE", () => {
  test("DELETE returns 204 and user is no longer available", async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe');
    const response = await supertest(app)
      .delete(`/api/users/${joe.data.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization",`Bearer ${joe.data.token}`);
    expect(response.status).toBe(204);
    expect(response.body).toStrictEqual({});
    const allRows = await supertest(app).get("/api/users");
    expect(allRows.status).toBe(200);
    const usernames: string[] = allRows.body.map((u: User) => u.username);
    expect(usernames).not.toContain(joe.name);
  });

  test("DELETE non-existing id returns 500", async () => {
    const response = await supertest(app)
      .delete("/api/users/100")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(500);
    expect(response.text).toStrictEqual("No user with id: 100");
  });
  test.only('fails if token session is inactive', async () => {
    const joe: UserWithData = userNamed(usersWithData,'joe');
    const res = await Session.update({active: false},{ where: { token: joe.data.token }})
    console.log('res',res)
    const response = await supertest(app)
      .delete(`/api/users/${joe.data.id}`)
      .set("Content-Type", "application/json")
      .set("Authorization",`Bearer ${joe.data.token}`);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Cannot perform this action on this session. User must log in.');
  })
});
