const express = require("express");
const app = express();
const colors = require("picocolors");

const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");
const { syncModels } = require("./models");

const {
  requestLog,
  upstreamMiddleware,
  downstreamErrorHandler,
} = require("./util/middleware");

const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");

app.use(requestLog);

app.use(express.json());

app.use(upstreamMiddleware);

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);

app.use(downstreamErrorHandler);

const start = async (PORT) => {
  await connectToDatabase();
  await syncModels();
  app.listen(PORT, (error) => {
    console.log(colors.yellow(`Attempting to connect on port ${PORT}`));
    if (error) {
      if (error.code === "EADDRINUSE") {
        console.warn(`Port ${PORT} already in use.`);
        start(PORT + 1);
        return;
      }
      throw error;
    }
    console.log(colors.yellow(`Server listening at http://localhost:${PORT}`));
  });
};

start(PORT);
