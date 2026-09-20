import Blog from "./blog.js";
import User from "./user.js";

User.hasMany(Blog);
Blog.belongsTo(User);

async function syncModels() {
  User.sync({ alter: true });
  Blog.sync({ alter: true });
}

export { Blog, User, syncModels };
