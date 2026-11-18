import { Blog, ReadingList, User } from "../../models/index.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";

export async function checkForReadingListExistence(userId: number, blogId: number): Promise<boolean> {
  const blog: Blog | null = await Blog.findByPk(blogId);
  if(!blog){
    throw new ErrorWithCustomStatus(404,`Unable to find blog with ${blogId}`);
  }
  const user: User | null = await User.findByPk(userId)
  if(!user){
    throw new ErrorWithCustomStatus(404,`Unable to find user with ${userId}`);
  }
  const all_rls = await ReadingList.findAll()
  const rl: ReadingList | null = await ReadingList.findOne({ where: { userId: userId, blogId: blogId }});
  return !!rl
}


