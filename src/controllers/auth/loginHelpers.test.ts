import {describe, test, expect,beforeAll } from "vitest";
import { createUsers } from "../../../testing/factories.ts";
import type { UserWithData } from "../../../testing/testing.types.ts";
import { Session } from "../../models/index.ts";
import type { InferAttributes } from "sequelize"; 
import { addLoginSession } from "./loginHelpers.ts";
import { userNamed } from "../../../testing/testingHelpers.ts";

const FAKE_TOKEN_VALUE = "THIS.IS.A.FAKE.TOKEN";

let users: UserWithData[];

beforeAll(async () => {
  users = await createUsers(); 
})

describe('login helpers', () => {
  test('add token to a new session', async () => {
    const joe: UserWithData = userNamed(users,'joe');
    const session = await Session.create({
      userId: joe.data.id,
      token: FAKE_TOKEN_VALUE 
    });
    expect(session.toJSON()).toStrictEqual({
      id: expect.any(Number),
      userId: joe.data.id,
      token: "THIS.IS.A.FAKE.TOKEN",
      active: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
  });

  test('addLoginSession returns session id', async () => {
    const joe: UserWithData = userNamed(users,'joe');
    const sessionId: number = await addLoginSession(FAKE_TOKEN_VALUE,joe.data.id)
    expect(sessionId).toBeTypeOf('number')
  });
});
