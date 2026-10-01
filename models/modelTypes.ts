interface UserResponseTypeFromSequelize extends UserResponseType {
  password: string;
}
interface UserResponseType extends UserNoPW {
  createdAt: string;
  updatedAt: string;
}

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
  blogs: number[];
}

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
  UserResponseType,
  BlogReqType,
  BlogResType,
  UserFromToken,
  UserResponseTypeFromSequelize,
};
