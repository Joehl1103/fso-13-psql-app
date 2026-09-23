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

function downstreamErrorHandler(err, req, res, next) {
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    const { name, errors } = err;
    err.message = errors[0].message;
  }

  const status = err.status || 500;
  res.status(status).end(err.message);
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
  // requestLog,
  // upstreamMiddleware
};
