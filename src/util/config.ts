import dotenv from "dotenv";

const CI_TESTING = Boolean(process.env.CI_TESTING);
if (!Boolean(process.env.CI_TESTING)) {
  const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
  dotenv.config({ path: envFile });
}

interface Config {
  DATABASE_URL: string;
  DATABASE_SSL: boolean | string;
  PORT: number;
  SECRET: string;
  SALT_ROUNDS: number;
}

const config: Config = {
  DATABASE_URL: CI_TESTING
    ? (process.env.TESTING_DATABASE_URL ?? "")
    : (process.env.DATABASE_URL ?? ""),
  DATABASE_SSL: process.env.DATABASE_SSL === "true" || "",
  PORT: Number(process.env.PORT) || 3001,
  SECRET: process.env.SECRET || "",
  SALT_ROUNDS: 10,
};

console.log(config);

export default config;
