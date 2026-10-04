import type { UserIdToBlogMap } from "./userTypes.ts";
import type {
  BlogResType,
  UserResponseTypeFromSequelize,
} from "../../models/modelTypes.ts";
import { User, Blog } from "../../models/index.js";
import type { Request, Response, NextFunction } from "express";

function parsePassword(password: string): string[] | any[] {
  const errorMessages: string[] | any[] = [];
  const pwLen: number = password.length;
  if (pwLen < 8) {
    errorMessages.push("pw too short. Minimum 8 characters.");
    return errorMessages;
  }
  const hasUC: boolean = /[A-Z]/.test(password);
  const hasLC: boolean = /[a-z]/.test(password);
  const hasNum: boolean = /[\d]/.test(password);
  const hasSC: boolean = /[^A-Za-z0-9\s]/.test(password);
  if (!hasUC || !hasLC || !hasNum || !hasSC) {
    errorMessages.push(
      "Password must contain at least one upper case letter, one lower case letter, one number and onespecialCharacter.",
    );
  }
  return errorMessages;
}

function parseUser(
  username: string,
  name: string,
  password: string,
): string[] | any[] {
  const errorMessages: string[] = [];
  if (!username) {
    errorMessages.push("no username.");
  }
  if (!name) {
    errorMessages.push("no name.");
  }
  if (!password) {
    errorMessages.push("no password");
  } else {
    const pwAnalysis: string[] | any[] = parsePassword(password);
    if (pwAnalysis.length > 0) {
      pwAnalysis.forEach((m: string) => errorMessages.push(m));
    }
  }
  return errorMessages;
}

function buildUserIdToBlogIdMap(
  userIds: number[],
  blogs: BlogResType[],
): Map<number, number[]> {
  console.group("buildUserIdToBlogIdMap");
  console.log("userIds", userIds);
  const userIdToBlogIdMap: UserIdToBlogMap = new Map(
    userIds.map((id) => [id, []]),
  );
  console.log("A");
  blogs.forEach((b: BlogResType, i: number) => {
    console.log(`b ${i + 1}`, b);
    const userIdExists: boolean = userIdToBlogIdMap.has(b.userId);
    console.log("A.1");
    if (userIdExists) {
      //NOTE: I do not know why this could be undefined, since I am initializing the [userId,[]] and then checking whether or not the userId exists
      const blogIdArray: number[] | any[] | undefined = userIdToBlogIdMap.get(
        b.userId,
      );
      if (blogIdArray !== undefined && !blogIdArray.includes(b.id)) {
        const newBlogIdArray: number[] = [...blogIdArray, b.id];
        userIdToBlogIdMap.set(b.userId, newBlogIdArray);
      } else {
        userIdToBlogIdMap.set(b.userId, [b.id]);
      }
    }
  });
  console.log("userIdToBlogIdMap", userIdToBlogIdMap);
  console.groupEnd();
  return userIdToBlogIdMap;
}

async function getUserIdToBlogMap(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("here in getUserIdToBlogMap");
  const users: User[] = await User.findAll();
  const usersJson: UserResponseTypeFromSequelize[] = users.map((u) =>
    u.toJSON(),
  );
  const userIds: number[] = usersJson.map(
    (u: UserResponseTypeFromSequelize) => u.id,
  );
  const allBlogs = await Blog.findAll();
  const allBlogsJson = allBlogs.map((b) => b.toJSON()) as BlogResType[];
  console.log("A");
  const userIdToBlogMap: Map<number, number[] | any[]> = buildUserIdToBlogIdMap(
    userIds,
    allBlogsJson,
  );
  console.log("B");
  req.userIdToBlogMap = userIdToBlogMap;
  next();
}

export { parseUser, buildUserIdToBlogIdMap, getUserIdToBlogMap };
