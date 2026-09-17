const express = require("express");
const app = express();

const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");

const blogsRouter = require("./controllers/blogs");

// NOTE: leaving this so that I can inspect the connection at start
app.use((req, res, next) => {
  console.log({
    method: req.method,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
  });
  next();
});

app.use(express.json());

console.log("before defining router");
app.use("/api/blogs", blogsRouter);
console.log("after defining router");

const start = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`error: ${error.message}`);
    return process.exit(1);
  }
};

start();
