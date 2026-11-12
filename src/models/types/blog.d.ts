import type { InferAttributes } from "sequelize";
import type {Blog} from "../../models/index.ts"

type BlogResTypeMinusUserId = Omit<BlogResType,"userId">

interface BlogResReadingList{
  id: number;
  read: boolean;
}

interface BlogWithReadingProps extends BlogResTypeMinusUserId {
  reading_list: BlogResReadingList
}

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

export type { 
  BlogType,
  BlogReqType,
  BlogResType,
  BlogMinusUserId,
  BlogResTypeMinusUserId,
  BlogWithReadingProps,
  BlogResReadingList
};
