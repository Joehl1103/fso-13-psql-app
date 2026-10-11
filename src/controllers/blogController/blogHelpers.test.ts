import { test, describe, expect } from "vitest";
import { parseAuth } from "./blogHelpers.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";

describe("Parse auth", () => {
  test("no auth throws 500", () => {
    try {
      parseAuth("");
    } catch (error) {
      if (error instanceof ErrorWithCustomStatus) {
        expect(error.status).toBe(500);
        expect(error.message).toBe("No auth provided");
      }
    }
  });
  test("incorrect Bearer format of any kind throws 500", () => {
    [
      "BearerSomethingOrOther",
      "Bearer SomthingOrOther",
      "Bearer 098203801231.lasdlajdaljsd`3`212.098130`98202.",
    ].forEach((str: string) => {
      console.log("str", str);
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
