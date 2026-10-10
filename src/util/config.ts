import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

const CI_TESTING: Boolean = Boolean(process.env.TEST_DATABASE_URL);

interface Config {
  DATABASE_URL: string;
  DATABASE_SSL: boolean | string;
  PORT: number;
  SECRET: string;
  SALT_ROUNDS: number;
}

const config: Config = {
  DATABASE_URL: CI_TESTING
    ? (process.env.TEST_DATABASE_URL ?? "")
    : (process.env.DATABASE_URL ?? ""),
  DATABASE_SSL: process.env.DATABASE_SSL === "true" || "",
  PORT: Number(process.env.PORT) || 3001,
  SECRET: process.env.SECRET || "",
  SALT_ROUNDS: 10,
};

export default config;
