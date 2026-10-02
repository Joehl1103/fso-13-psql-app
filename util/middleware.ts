import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "sequelize";
import type { DownstreamError } from "./errorTypes.ts";
import colors from "picocolors";
// function printInfo(message, req, res, next) {
//   console.log(`${message} ${res.statusCode} ${req.method} ${res.originalUrl}`);
// }
// function upstreamMiddleware(error, req, res, next) {
//   res.addEventListener("finish", () => {
//     if (res.statusCode >= 400) {
//       printInfo("HTTP ERROR", req, res);
//     } else {
//       printInfo("", req, res);
//     }
//   });
//   next();
// }
//

function blogPostValidator(req: Request, res: Response, next: NextFunction) {
  console.log("validating request for blog post.");
  const { author, url, title, token } = req.body;
  console.log({
    author: author,
    url: url,
    title: title,
    token: token,
  });
  next();
}

function downstreamErrorHandler(
  err: DownstreamError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    if (err instanceof ValidationError && err.errors) {
      const { errors } = err;
      errors.length > 0
        ? (err.message = errors.map((e) => e.message).join(" "))
        : (err.message =
            "could not find errors object on SequelizeValidationError");
    }
  }

  res.status(500).end(err.message);
}

// function requestLog(req, res, next) {
//   console.log({
//     method: req.method,
//     originalUrl: req.originalUrl,
//     baseUrl: req.baseUrl,
//     path: req.path,
//   });
//   next();
// }

export {
  downstreamErrorHandler,
  blogPostValidator,
  // requestLog,
  // upstreamMiddleware
};
