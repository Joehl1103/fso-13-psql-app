import { ReadingList, User } from "../../models/index.ts";

export async function checkForReadingListExistence(userId: number, blogId: number): Promise<boolean> {
  const user: User | null = await User.findByPk(userId)
  if(!user){
    throw new Error(`Unable to find user with ${userId}`);
  }
  const rl: ReadingList | null = await ReadingList.findOne({ where: { userId: userId, blogId: blogId }});
  return !!rl
}


