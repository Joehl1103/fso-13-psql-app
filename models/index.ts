import { sequelize } from "../util/db.js";
import Blog from "./blog.ts";
import User from "./user.ts";
import path from "node:path";
const filename = path.basename(import.meta.filename);

User.hasMany(Blog, {
  foreignKey: "userId",
});
Blog.belongsTo(User, {
  foreignKey: "userId",
});

async function syncModels() {
  console.log(`${filename} || Syncing models.`);
  await sequelize.sync({ alter: true });
  console.log(`${filename} || models synced.`);
}

export { Blog, User, syncModels };
