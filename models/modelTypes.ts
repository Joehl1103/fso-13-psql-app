import { User } from "./index.js";
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
  blogs: number[] | any[];
}
type SequelizeUserUpdateResult = [affectedCount: number, affectedRows: User[]];

type FindASingleUserResponse = User | null;

interface BlogResType extends BlogType {
  id: number;
  likes: number;
  userId: number;
}

interface BlogReqType extends BlogType {
  token: string;
}

interface BlogType {
  author: string;
  url: string;
  title: string;
}

export type {
  UserRequestType,
  BlogType,
  BlogReqType,
  BlogResType,
  UserFromToken,
  UserResponseTypeFromAPI,
  UserResponseTypeFromSequelize,
  UserNoPW,
  UserPOSTResponseTypeFromAPI,
  FindASingleUserResponse,
  SequelizeUserUpdateResult,
};
