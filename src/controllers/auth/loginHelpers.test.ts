import {describe, test, expect,beforeAll } from "vitest";
import { createUsers } from "../../../testing/factories.ts";
import type { UserWithData } from "../../../testing/testing.types.ts";
import { Session } from "../../models/index.ts";
import type { InferAttributes } from "sequelize";

let users: UserWithData[];
function userNamed(users: UserWithData[],name: string): UserWithData {
  const user: UserWithData | undefined = users.find((u: UserWithData) => u.name === name)
  if(!user){
    throw new Error(`No user with name ${name}`);
  }
  return user
}
beforeAll(async () => {
  users = await createUsers(); 
})

describe('login helpers', () => {
  test('add token to a new session', async () => {
    const joe: UserWithData = userNamed(users,'joe')
    const session = await Session.create({
      userId: joe.data.id,
      token: "THIS.IS.A.FAKE.TOKEN"
    })
    console.log('session',session.toJSON())
    expect(session.toJSON()).toStrictEqual({
      id: expect.any(Number),
      userId: joe.data.id,
      token: "THIS.IS.A.FAKE.TOKEN",
      active: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    })
  })
})
