require("dotenv").config();
// const express = require("express");
// const app = express();
const { Sequelize, DataTypes, QueryTypes, Model } = require("sequelize");
const fs = require("fs");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
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

class Blog extends Model {}

Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    author: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultvalue: 0,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: "blog",
  },
);

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Connection established.");
    const blogs = await sequelize.query("SELECT * FROM blogs", {
      type: QueryTypes.SELECT,
    });
    blogs.forEach((b) => {
      console.log(`${b.author}: '${b.title}', ${b.likes} likes`);
    });
    await sequelize.close();
    console.log("Connection closed");
  } catch (error) {
    console.error("Something went wrong", error);
  }
}

main();
