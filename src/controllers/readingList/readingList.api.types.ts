interface ReadingListReqBody {
  blogId: string;
  userId: string;
  read: boolean
}

type ReadingListRawPayload = Omit<ReadingListSequelizePayload,"read">

type ReadingListSequelizePayload = Omit<ReadingListResBody,"id"> 

interface ReadingListResBody {
  id: number;
  blogId: number;
  userId: number;
  read: boolean;
}

export type {
  ReadingListReqBody,
  ReadingListResBody,
  ReadingListSequelizePayload,
  ReadingListRawPayload
};
