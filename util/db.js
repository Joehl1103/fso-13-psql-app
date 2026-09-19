const Sequelize = require("sequelize");
const fs = require("node:fs");
const { DATABASE_URL } = require("./config");
const { logSql } = require("./sql");

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: logSql,
  dialectOptions: {
    ssl: {
      require: true,
      /*
       * ⚠️ Security Warning: Do not use rejectUnauthorized: false in production environments,
       * as it makes your application vulnerable to Man-in-the-Middle (MitM) attacks.
       * */
      ca: fs
        .readFileSync(
          "/Users/josephshomefolder/.postgres/fso_13_postgres_aiven_ca.pem",
        )
        .toString(),
    },
  },
});

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

module.exports = { connectToDatabase, sequelize };
