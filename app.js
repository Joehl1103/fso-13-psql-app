import express from "express";

import {
  // requestLog,
  // upstreamMiddleware,
  downstreamErrorHandler,
} from "./util/middleware.js";

import blogsRouter from "./controllers/blogs.js";
import usersRouter from "./controllers/users.js";

const app = express();

// app.use(requestLog);

app.use(express.json());

// app.use(upstreamMiddleware);

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);

app.use(downstreamErrorHandler);

export default app;
