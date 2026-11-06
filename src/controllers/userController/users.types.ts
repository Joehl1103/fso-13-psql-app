type UserIdToBlogMap = Map<number, number[] | any[]>;

interface UserReadings {
  id: number,
  url: string,
  title: string,
  author: string,
  likes: number,
  year: null
}

export type { UserIdToBlogMap,UserReadings };
