import type { InferAttributes } from "sequelize";

interface BlogResType extends BlogType {
  id: number;
  likes: number;
  userId: number;
  year: number | null;
}

interface BlogReqType extends BlogType {
  year?: number;
}

interface BlogType {
  author: string;
  url: string;
  title: string;
}

type BlogMinusUserId = Omit<InferAttributes<Blog>,"userId">

export type { BlogType, BlogReqType, BlogResType, BlogMinusUserId };
