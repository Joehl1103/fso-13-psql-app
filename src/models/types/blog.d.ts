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

export type { BlogType, BlogReqType, BlogResType };
