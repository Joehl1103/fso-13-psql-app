interface ReadingListReqBody {
  blogId: number;
  userId: number;
}

interface ReadingListResBody {
  id: number;
  blogId: number;
  userId: number;
  read: Boolean;
}

export type { ReadingListReqBody, ReadingListResBody };
