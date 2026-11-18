import { test, describe, expect, beforeAll } from "vitest";
import { parseAuth, verifyUserFromToken } from "./helpers.ts";
import { ErrorWithCustomStatus } from "../util/errorTypes.ts";
import { Session, User } from "../models/index.ts";

describe("Parse auth", () => {
  test("incorrect Bearer format of any kind throws 500", () => {
    [
      "BearerSomethingOrOther",
      "Bearer SomthingOrOther",
      "Bearer 098203801231.lasdlajdaljsd`3`212.098130`98202.",
    ].forEach((str: string) => {
      expect(() => parseAuth(str)).toThrow(
        "Format of Bearer token is incorrect.",
      );
    });
  });
  test("correct bearer format returns jwt", () => {
    const bearerPrefix: string = "Bearer ";
    const token: string =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QxQGV4YW1wbGUuY29tIiwiaWQiOjEsImlhdCI6MTc5MTY4NTY2Nn0.G2BV9XlizqShQBqs_ZdHQ5caszdOmsnqmVjJIspV5nQ";
    const res: string = parseAuth(`${bearerPrefix}${token}`);
    expect(res).toBe(token);
  });
});

describe('verifyUserFromToken', () => {
  beforeAll(async () => {
    const user = await User.create({ name: 'joe', username: 'joe@joe.com',password: 'temp',disabled: false})
    await Session.create({ userId: user.id, token: 'FAKE.TOKEN',active: false })
  })
  test('inactive session throws error', async () => {
    await expect(() => verifyUserFromToken('FAKE.TOKEN','temp secret')).rejects.toThrow('jwt malformed')
  })
})
