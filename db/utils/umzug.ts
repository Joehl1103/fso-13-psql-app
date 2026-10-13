import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "./db.ts";

const umzug = new Umzug({
  migrations: { glob: "db/migrations/*.js" },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

export { umzug };
