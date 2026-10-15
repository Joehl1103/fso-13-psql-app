import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";
import config from "../../src/util/config.ts";
import { databaseOptions } from "./db.ts";

const sequelize = new Sequelize(config.DATABASE_URL, databaseOptions);

const umzug = new Umzug({
  migrations: { glob: "db/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export { umzug };
