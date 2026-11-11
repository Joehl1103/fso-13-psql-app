import type { InferAttributes } from "sequelize";
import type {Blog} from "../../models/index.ts"

type BlogResTypeMinusUserId = Omit<BlogResType,"userId">

interface BlogWithReadingProps extends BlogResTypeMinusUserId {
  [readingList: string]: {
    id: number,
    read: boolean
  }
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
  BlogWithReadingProps
};
