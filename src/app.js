import express from "express";
import { downstreamErrorHandler } from "./util/middleware.ts";

import blogsRouter from "./controllers/blogs.ts";
import usersRouter from "./controllers/userController/users.ts";
import loginRouter from "./controllers/login.js";
import authorRouter from "./controllers/authors.ts";
import healthRouter from "./controllers/health.ts";
import resetRouter from "./controllers/reset.ts";

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

app.use(downstreamErrorHandler);

export default app;
