import { User } from "./index.js";
import type { BlogResType } from "../blog.ts"

interface UserResponseTypeFromSequelize extends UserResponseTypeFromAPI {
  createdAt: string;
  updatedAt: string;
  password: string;
}

interface UserResponseTypeFromAPI extends UserNoPW {
  createdAt: string;
  updatedAt: string;
}

type UserPOSTResponseTypeFromAPI = Omit<UserNoPW, "blogs">;

type UserNoPW = Omit<UserType, "password">;

type UserRequestType = Omit<UserType, "id" | "blogs">;

interface UserFromToken extends UserFromTokenBase {
  iat: number;
}
type UserFromTokenBase = Omit<UserType, "password" | "name" | "blogs">;

interface UserType {
  id: number;
  username: string;
  name: string;
  password: string;
  blogs?: BlogResType[];
}

type FindASingleUserResponse = User | null;

export type {
  UserRequestType,
  UserFromToken,
  UserResponseTypeFromAPI,
  UserResponseTypeFromSequelize,
  UserNoPW,
  UserPOSTResponseTypeFromAPI,
  FindASingleUserResponse,
  SequelizeUserUpdateResult,
};
