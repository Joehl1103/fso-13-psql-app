import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";
import config from "../../../util/config.ts";
import { databaseOptions } from "../dbConfig.ts";

console.log(
  `Building sequelize object with DATABASE_URL=${config.DATABASE_URL}`,
);
const sequelize = new Sequelize(config.DATABASE_URL, databaseOptions);

console.log("sequelize", sequelize);

const umzug = new Umzug({
  migrations: { glob: "db/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export { sequelize, umzug };
