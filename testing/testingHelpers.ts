import { createUsers } from "./factories.ts";
import type { UserWithData } from "./testing.types.ts";

export async function returnJoeAndJoey() {
  let joe: UserWithData, joey: UserWithData;
  const users = await createUsers();
  const joeRes = users.filter((u) => u.name === "joe")[0];
  if (!joeRes) {
    throw new Error("Joe is undefined");
  }
  joe = joeRes;
  const joeyRes = users.filter((u) => u.name === "joey")[0];
  if (!joeyRes) {
    throw new Error("Joe or joey is undefined, or both");
  }
  joey = joeyRes;
  return { joe, joey };
}

export const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
export const urlRegex =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}/;
