import fs from "node:fs";
import Sequelize from "sequelize";
import path from "node:path";

import { DATABASE_URL, DATABASE_SSL } from "./config.js";
import { logSql } from "./sql.js";
const filename = path.basename(import.meta.filename);

const databaseOptions = {
  dialect: "postgres",
  logging: false,
};

if (DATABASE_SSL) {
  const cert = fs
    .readFileSync(
      "/Users/josephshomefolder/.postgres/fso_13_postgres_aiven_ca.pem",
    )
    .toString();
  databaseOptions.dialectOptions = {
    ssl: {
      require: DATABASE_SSL,
      /*
       * ⚠️ Security Warning: Do not use rejectUnauthorized: false in production environments,
       * as it makes your application vulnerable to Man-in-the-Middle (MitM) attacks.
       * */
      ca: cert,
    },
  };
}

const sequelize = new Sequelize(DATABASE_URL, databaseOptions);

const connectToDatabase = async () => {
  try {
    console.log(
      `${filename} || Connecting to database at '${DATABASE_URL}'...`,
    );
    await sequelize.authenticate();
    console.log(`${filename} || Connected to database`);
  } catch (error) {
    console.error(
      `${filename} || Failed to connect to the database: ${error.message}`,
    );
    return process.exit(1);
  }
  return null;
};

export { connectToDatabase, sequelize };
