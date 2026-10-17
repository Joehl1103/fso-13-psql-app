import { umzug, sequelize } from "./umzug.ts";

(async function runMigrations() {
  await sequelize.authenticate();
  console.log("umzug", umzug);
  const migrations = await umzug.down();
  console.log("Migrations rolled back", {
    files: migrations.map((mig) => mig.name),
  });
})();
