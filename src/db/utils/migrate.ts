import { umzug, sequelize } from "./umzug.ts";

(async function runMigrations() {
  await sequelize.authenticate();
  const migrations = await umzug.up();
  console.log("Migrations up to date", {
    files: migrations.map((mig) => mig.name),
  });
})();
