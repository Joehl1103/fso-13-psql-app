import { User } from "../../models/index.js";

type UserIdToBlogMap = Map<number, number[] | any[]>;

type SequelizeUserUpdateResult = Promise<
  [affectedCount: number, affectedRows: User[]]
>;

export type { UserIdToBlogMap, SequelizeUserUpdateResult };
