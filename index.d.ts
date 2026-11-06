import type { UserIdToBlogMap } from "./controllers/users.types.ts";

declare global {
  namespace Express {
    interface Request {
      userIdToBlogMap: UserIdToBlogMap;
      token: string;
    }
  }
}
