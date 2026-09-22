import colors from "picocolors";
function printInfo(message, req, res, next) {
  console.log(`${message} ${res.statusCode} ${req.method} ${res.originalUrl}`);
}
function upstreamMiddleware(error, req, res, next) {
  res.addEventListener("finish", () => {
    if (res.statusCode >= 400) {
      printInfo("HTTP ERROR", req, res);
    } else {
      printInfo("", req, res);
    }
  });
  next();
}

function downstreamErrorHandler(err, req, res, next) {
  if (/Sequelize/.test(err.name)) {
    console.log(colors.red("SEQUELIZE ERROR"));
    console.log({
      message: err.message,
      detail: err.parent.detail,
      type: err.type,
      value: err.value,
    });
    res
      .status(500)
      .json({ error: { message: err.message, detail: err.detail } });
  } else {
    console.log(colors.red("GENERAL ERROR"));
    // console.error({
    //   message: err.message,
    //   status: err.status,
    //   method: req.method,
    //   url: req.originalUrl,
    //   stack: err.stack,
    // });

    if (res.headerSent) {
      return next(err);
    }

    const status = err.status || 500;
    console.log("status", status);
    res.status(status).end(err.message);
  }
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

export { downstreamErrorHandler, requestLog, upstreamMiddleware };
