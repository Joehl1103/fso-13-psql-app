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

const start = async (PORT) => {
  await connectToDatabase();
  app.listen(PORT, (error) => {
    console.log(`Attempting to connect on port ${PORT}`);
    if (error) {
      if (error.code === "EADDRINUSE") {
        console.warn(`Port ${PORT} already in use.`);
        start(PORT + 1);
        return;
      }
      throw error;
    }
    console.log(`Server listening at http://localhost:${PORT}`);
  });
};

start(PORT);
