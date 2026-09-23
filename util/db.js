import fs from "node:fs";
import Sequelize from "sequelize";

import { DATABASE_URL, DATABASE_SSL } from "./config.js";
import { logSql } from "./sql.js";

const databaseOptions = {
  dialect: "postgres",
  logging: logSql,
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
    await sequelize.authenticate();
    console.log("connected to database");
  } catch (error) {
    console.error(`Failed to connect to the database: ${error.message}`);
    return process.exit(1);
  }
  return null;
};

export { connectToDatabase, sequelize };
