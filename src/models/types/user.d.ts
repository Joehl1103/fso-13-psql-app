import type { User } from "../index.ts";
import type { BlogResType,BlogMinusUserId } from "../blog.ts"
import type { InferAttributes } from "sequelize";
import type { Blog } from "../index.ts"


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

interface UserWithAssociations extends InferAttributes<User> {
  blogs: InferAttributes<Blog>[];
  readings: InferAttributes<Blog>[];
}

interface UserWithAssociationsMinusUserId extends UserNoPW {
  blogs: BlogMinusUserId[];
  readings: BlogMinusUserId[];
}

export type {
  UserRequestType,
  UserFromToken,
  UserResponseTypeFromAPI,
  UserResponseTypeFromSequelize,
  UserNoPW,
  UserPOSTResponseTypeFromAPI,
  FindASingleUserResponse,
  SequelizeUserUpdateResult,
  UserWithAssociationsMinusUserId,
  UserWithAssociations
};
