import { sequelize } from "../util/db.js";
import Blog from "./blog.ts";
import User from "./user.ts";
import Author from "./author.ts";
import path from "node:path";
const filename = path.basename(import.meta.filename);

User.hasMany(Blog, {
  foreignKey: "userId",
});
Blog.belongsTo(User, {
  foreignKey: "userId",
});
Author.belongsTo(User, {
  foreignKey: "userId",
});

interface AuthorObject {
  [author: string]: {
    likes: number;
    blogs: number;
  };
}

async function testModelInitialization() {
  const blogs: Blog[] = await Blog.findAll();
  console.log("blogs", blogs);
  if (!blogs || blogs.length === 0) {
    throw new Error("No blogs");
  }
  const authors: Set<string> = new Set(blogs.map((b: Blog) => b.author));
  console.log("authors", authors);
  let authorObject: AuthorObject | {};
  //NOTE: why does `a` not get defined as the key of the author object being initialized?
  authors.forEach((a: string) => {
    authorObject = { ...authorObject, a: { likes: 0, blogs: 0 } };
  });
  console.log("authorObject", authorObject);
}
async function syncModels() {
  console.log(`${filename} || Syncing models.`);
  await sequelize.sync({ alter: true });
  console.log(`${filename} || models synced.`);
}

export { Blog, User, syncModels, testModelInitialization };
