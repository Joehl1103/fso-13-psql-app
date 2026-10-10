import fs from "node:fs";
import { Sequelize } from "sequelize";
import path from "node:path";
/* NOTE: I don't know why I am getting:
 *Diagnostics:
1. Circular definition of import alias 'DatabaseOptions'. [2303]
2. Module '"./db.d.ts"' declares 'DatabaseOptions' locally, but it is not exported. [2459]
   db.ts:7:15: 'DatabaseOptions' is declared here.
 */
import type { DatabaseOptions } from "./db.d.ts";
import config from "./../../src/util/config.ts";
const DATABASE_URL = config.DATABASE_URL;
const DATABASE_SSL = config.DATABASE_SSL;
//NOTE: used for troubleshooting
// import { logSql } from "./sql.js";
const filename = path.basename(import.meta.filename);

const databaseOptions: DatabaseOptions = {
  dialect: "postgres",
  logging: false,
  dialectOptions: {},
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
    if (error instanceof Error) {
      console.error(
        `${filename} || Failed to connect to the database: ${error.message}`,
      );
    }
    return process.exit(1);
  }
  return null;
};

export { connectToDatabase, sequelize };
