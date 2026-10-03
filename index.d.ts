import type { UserIdToBlogMap } from "./controllers/userTypes.ts";

declare global {
  namespace Express {
    interface Request {
      userIdToBlogMap: UserIdToBlogMap;
    }
  }
}
