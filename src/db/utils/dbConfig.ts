import config from "./../../util/config.ts";
const DATABASE_SSL = config.DATABASE_SSL;
import fs from "node:fs";
import type { Options } from "sequelize";
//NOTE: used for troubleshooting
// import { logSql } from "./sql.js";

const databaseOptions: Options = {
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

export { databaseOptions };
