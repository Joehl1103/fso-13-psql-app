interface UserResponseType extends UserNoPW {
  createdAt: string;
  updatedAt: string;
}

type UserNoPW = Omit<UserType, "password">;
type UserRequestType = Omit<UserType, "id">;

interface UserType {
  id: number;
  username: string;
  name: string;
  password: string;
}

interface BlogResType extends BlogType {
  likes: number;
  userId: number;
}

interface BlogType {
  author: string;
  url: string;
  title: string;
  token: string;
}

export type { UserRequestType, UserResponseType, BlogType, BlogResType };
