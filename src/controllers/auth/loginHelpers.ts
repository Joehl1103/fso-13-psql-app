import { Session } from "../../models/index.ts"

export async function addLoginSession(token: string,userId: number): Promise<number> {

  const session = await Session.create({
      userId,
      token
    })
  if(!session){
    throw new Error(`Unable to create a session for user with id ${userId}`);
  }
  return session.id
}
