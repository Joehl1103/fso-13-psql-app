import config from "../../util/config.ts";
import { databaseOptions } from "./dbConfig.ts";
import { Sequelize } from "sequelize";
import path from "node:path";
/* NOTE: I don't know why I am getting:
 *Diagnostics:
1. Circular definition of import alias 'DatabaseOptions'. [2303]
2. Module '"./db.d.ts"' declares 'DatabaseOptions' locally, but it is not exported. [2459]
   db.ts:7:15: 'DatabaseOptions' is declared here.
 */
const filename = path.basename(import.meta.filename);

console.log(`Building sequelize object with ${config.DATABASE_URL}`);
const sequelize = new Sequelize(config.DATABASE_URL, databaseOptions);

const connectToDatabase = async () => {
  try {
    console.log(
      `${filename} || Connecting to database at '${config.DATABASE_URL}'...`,
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
