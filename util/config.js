import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });
process.env.DATABASE_URL;

const DATABASE_URL = process.env.DATABASE_URL;
const DATABASE_SSL = process.env.DATABASE_SSL === "true";
const PORT = process.env.PORT || 3001;

export { DATABASE_URL, DATABASE_SSL, PORT };
