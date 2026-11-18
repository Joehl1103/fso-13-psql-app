import { Blog, ReadingList, User } from "../../models/index.ts";
import { ErrorWithCustomStatus } from "../../util/errorTypes.ts";
import type { ModelStatic } from "sequelize";

export async function checkForReadingListExistence(userId: number, blogId: number): Promise<boolean> {
  console.group('checkForReadingListExistence')
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
  console.groupEnd()
  return !!rl
}

export async function checkForRecordExistence(id: string,message: string, model: ModelStatic<User | Blog>): Promise<void> {
  const recordExists = await (async (id: string): Promise<boolean> => {

    const res = await model.findByPk(id);
    return !!res
  })(id)
  if(!recordExists){
    throw new ErrorWithCustomStatus(400,message)
  }
  return
}
