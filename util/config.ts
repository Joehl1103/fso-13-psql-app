import dotenv from "dotenv";

if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV is undefined");
}

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

interface Config {
  DATABASE_URL: string;
  DATABASE_SSL: boolean | string;
  PORT: number;
  SECRET: string;
  SALT_ROUNDS: number;
}
const config: Config = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_SSL: process.env.DATABASE_SSL === "true" || "",
  //TODO: here
  PORT: Number(process.env.PORT) || 3001,
  SECRET: process.env.SECRET || "",
  SALT_ROUNDS: 10,
};

for (const [key, value] of Object.entries(config)) {
  if (!value) {
    throw new Error(`${key} is undefined.`);
  }
}

export default config;
