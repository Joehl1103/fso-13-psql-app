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
