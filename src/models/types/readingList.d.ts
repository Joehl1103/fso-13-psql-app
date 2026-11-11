import type { ReadingList } from "../index.ts"
import type { InferAttributes } from "sequelize"

type UserReadingProps = Omit<InferAttributes<ReadingList>,"userId" | "blogId">

export type { UserReadingProps }
