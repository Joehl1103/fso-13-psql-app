import express from "express";
import { downstreamErrorHandler } from "./util/middleware.ts";

import blogsRouter from "./controllers/blogController/blogs.ts";
import usersRouter from "./controllers/userController/users.ts";
import loginRouter from "./controllers/login.ts";
import authorRouter from "./controllers/authors.ts";
import healthRouter from "./controllers/health.ts";
import resetRouter from "./controllers/reset.ts";
import readingListRouter from "./controllers/readingList/readingList.ts";

const app = express();

// app.use(requestLog);

app.use(express.json());

// app.use(upstreamMiddleware);
app.use("/api/login", loginRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/authors", authorRouter);
app.use("/api", healthRouter);
app.use("/api/reset", resetRouter);
app.use("/api/readingList",readingListRouter);

app.use(downstreamErrorHandler);

export default app;
