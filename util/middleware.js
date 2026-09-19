function printInfo(message, req, res, next) {
  console.log(`${message} ${res.statusCode} ${req.method} ${res.originalUrl}`);
}

function upstreamMiddleware(error, req, res, next) {
  const method = req.method;
  if (method === "PATCH" || method === "DELETE") {
    const id = req.params.id;
    if (!id) {
      return res.status(400).end("No id");
    }
  }
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      printInfo("HTTP ERROR", req, res);
    } else {
      printInfo("", req, res);
    }
  });
  next();
}

function downstreamErrorHandler(err, req, res, next) {
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
}

function requestLog(req, res, next) {
  console.log({
    method: req.method,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
  });
  next();
}

module.exports = {
  requestLog,
  downstreamErrorHandler,
  upstreamMiddleware,
};
