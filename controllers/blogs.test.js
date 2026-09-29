import supertest from "supertest";
import { describe, test, expect, beforeEach, beforeAll } from "vitest";
import app from "../app.js";

describe("GET", () => {
  beforeEach(async () => {
    const blogPayload = [
      {
        author: joe.name,
        url: "http://joes-blog.com",
        title: "Talkin' about my blog",
        token: joe.token,
      },
      {
        author: joey.name,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        token: joey.token,
      },
    ];
    await Promise.all(
      blogPayload.map(async (b) => {
        console.log("b", b);
        return await supertest(app)
          .post("/api/blogs")
          .set("Content-Type", "application/json")
          .send(b);
      }),
    );
  });
  test.only("getting all blogs returns all blogs and their users", async () => {
    const response = await supertest(app).get("/api/blogs");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    response.body.forEach((b) => {
      expect(b.userId).toBeTypeOf("number");
    });
  });
});

describe("POST", () => {
  test("creating blog with token creates blog with user id", async () => {
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
  let blogId;
  beforeEach(async () => {
    const payload = {
      author: joe.name,
      url: "http://joeys-blog.com",
      title: "Talkin' about my blog",
      token: joe.token,
    };
    const response = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .send(payload);
    ({ id: blogId } = response.body);
  });

  test("deletion fails if no token provided", async () => {
    const response = await supertest(app).delete(`/api/blogs/${blogId}`);
    expect(response.status).toBe(500);
    expect(response.text).toBe("No token provided");
  });

  test("deletion fails if token belongs to different user", async () => {
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .send({ token: joey.token });
    expect(response.status).toBe(500);
    expect(response.text).toBe(
      "Cannot fulfill request because token does not belong to owner.",
    );
  });

  test.only("deletion if user id is same as blog id ", async () => {
    const response = await supertest(app)
      .delete(`/api/blogs/${blogId}`)
      .set("Content-Type", "application/json")
      .send({ token: joe.token });
    expect(response.status).toBe(204);
  });
});
