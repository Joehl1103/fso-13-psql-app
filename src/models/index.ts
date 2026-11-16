import { sequelize } from "../db/utils/db.ts";
import Blog from "./blog.ts";
import User from "./user.ts";
import ReadingList from "./readingList.ts";
import Session from "./session.ts"
import path from "node:path";
const filename = path.basename(import.meta.filename);

User.hasMany(Blog, {
  foreignKey: "userId",
  as: 'blogs',
});

Blog.belongsTo(User, {
  foreignKey: "userId",
  as: 'blogAuthor',
});

User.belongsToMany(Blog, { 
  through: ReadingList,
  as: 'readings',
  foreignKey: 'userId',
  otherKey: 'blogId'
});

Session.belongsTo(User, {
  foreignKey: 'userId',
})


async function syncModels() {
  console.log(`${filename} || Syncing models.`);
  await sequelize.sync({ alter: true });
  console.log(`${filename} || models synced.`);
}

export { Blog, User, ReadingList,Session, syncModels };
