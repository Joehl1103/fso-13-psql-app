import dotenv from "dotenv";

const CI_TESTING = Boolean(process.env.CI_TESTING);
let databaseUrl: string | undefined;
if (!Boolean(CI_TESTING)) {
  const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
  dotenv.config({ path: envFile });
  databaseUrl = process.env.DATABASE_URL ?? "";
} else {
  databaseUrl = process.env.TESTING_DATABASE_URL ?? "";
}

if (!databaseUrl) {
  throw new Error(`databaseUrl is empty or undefined ${databaseUrl}`);
}

interface Config {
  DATABASE_URL: string;
  DATABASE_SSL: boolean | string;
  PORT: number;
  SECRET: string;
  SALT_ROUNDS: number;
}

const config: Config = {
  DATABASE_URL: databaseUrl,
  DATABASE_SSL: process.env.DATABASE_SSL === "true" || "",
  PORT: Number(process.env.PORT) || 3001,
  SECRET: process.env.SECRET || "",
  SALT_ROUNDS: 10,
};

console.log(config);

export default config;
