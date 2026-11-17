import {test,describe,expect,beforeAll } from "vitest";
import { Session } from "../../models/index.ts"
import supertest from "supertest";
import app from "../../app.js";
import { createUsers } from "../../../testing/factories.ts";

let token: string,sessionId: number;
beforeAll(async () => {
  await createUsers()
  const res = await supertest(app)
    .post('/api/login')
    .set('Content-Type','application/json')
    .send({ username: 'joe@joe.com', password: "ABcd12!&" })
  const {token: receivedToken, sessionId: receivedSessionId} = res.body
  token = receivedToken
  sessionId = receivedSessionId
})

test('logging out disables session', async () => {
  const res = await supertest(app)
    .post('/api/logout')
    .set('Content-Type','application/json')
    .set('Authorization',`Bearer ${token}`)
    .send({
      sessionId: sessionId
    })
  expect(res.status).toBe(200)
  expect(res.body).toStrictEqual({
    sessionId: sessionId,
    active: false
  })
})
