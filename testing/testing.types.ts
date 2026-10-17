export interface User {
  username: string;
  name: string;
  password: string;
  token: string;
  blogs: number[];
  id: number;
}
export interface UserWithData {
  name: string;
  data: User;
}

export interface BlogPayloadData {
  author: string;
  url: string;
  title: string;
  token: string;
}

export type BlogPayload = Omit<BlogPayloadData, "token">;
