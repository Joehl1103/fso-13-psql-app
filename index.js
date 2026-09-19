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

function printInfo(message, req, res) {
  console.error(
    `${message} ${res.statusCode} ${req.method} ${req.originalUrl}`,
  );
}

app.use(express.json());

app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      printInfo("HTTP ERROR", req, res);
    } else {
      printInfo("", req, res);
    }
  });
  next();
});

app.use("/api/blogs", blogsRouter);

app.use((req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} '${req.originalUrl}'`,
  );

  error.status = 404;

  next(error);
});

app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR");
  console.error({
    message: err.message,
    status: err.status,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  if (res.headerSent) {
    return next(err);
  }

  const status = err.status || 500;

  res.status(status).json({
    error: err.message,
    status,
    method: req.method,
    url: req.originalUrl,
  });
});

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
