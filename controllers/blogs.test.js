import supertest from "supertest";
import { describe, test, expect, beforeEach } from "vitest";
import app from "../app.js";

describe("POST", () => {
  const usernameConst = "joey@joey.com";
  let usernameRef, nameRef, idRef;
  beforeEach(async () => {
    const userRes = await supertest(app).get("/api/users");
    const theUser = userRes.body.filter((u) => u.username === usernameConst);
    ({ id: idRef, name: nameRef, username: usernameRef } = theUser[0]);
    expect(usernameRef).toBe(usernameConst);
  });

  test.only("creating blog with token creates blog with user id", async () => {
    const loginRes = await supertest(app)
      .post("/api/login")
      .set("Content-Type", "application/json")
      .send({ username: usernameRef, password: "ABcd12!&" });
    const token = loginRes.body.token;
    const blogsResponse = await supertest(app)
      .post("/api/blogs")
      .set("Content-Type", "application/json")
      .send({
        author: nameRef,
        url: "http://joeys-blog.com",
        title: "Talkin' about my blog",
        token: token,
      });
    const { author, id, likes, title, url, userId } = blogsResponse.body;
    expect(id).toBeTypeOf("number");
    expect(author).toBe(nameRef);
    expect(likes).toBe(0);
    expect(title).toBe("Talkin' about my blog");
    expect(url).toBe("http://joeys-blog.com");
    expect(userId).toBe(idRef);
  });
});
