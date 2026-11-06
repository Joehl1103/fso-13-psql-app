interface ReadingListReqBody {
  blogId: string;
  userId: string;
}

interface ReadingListPayload {
  blogId: string,
  userId: string,
  read: boolean
} 

interface ReadingListResBody {
  id: number;
  blogId: number;
  userId: number;
  read: boolean;
}

export type { ReadingListReqBody, ReadingListResBody, ReadingListPayload };
