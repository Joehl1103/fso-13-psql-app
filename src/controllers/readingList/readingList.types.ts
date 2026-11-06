interface ReadingListReqBody {
  blogId: string;
  userId: string;
}

type ReadingListPayload = Omit<ReadingListResBody,"id"> 

interface ReadingListResBody {
  id: number;
  blogId: number;
  userId: number;
  read: boolean;
}

export type { ReadingListReqBody, ReadingListResBody, ReadingListPayload };
