import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";
import config from "../../../util/config.ts";
import { databaseOptions } from "../dbConfig.ts";

const sequelize = new Sequelize(config.DATABASE_URL, databaseOptions);

const umzug = new Umzug({
  migrations: { glob: "src/db/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export { sequelize, umzug };
