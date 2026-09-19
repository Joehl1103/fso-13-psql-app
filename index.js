const express = require("express");
const app = express();

const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");
const {
  requestLog,
  upstreamMiddleware,
  downstreamErrorHandler,
} = require("./util/middleware");

const blogsRouter = require("./controllers/blogs");

app.use(requestLog);

app.use(express.json());

app.use(upstreamMiddleware);

app.use("/api/blogs", blogsRouter);

app.use(downstreamErrorHandler);

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
