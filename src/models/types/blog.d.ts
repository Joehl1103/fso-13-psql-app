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

export type { BlogType, BlogReqType, BlogResType };
