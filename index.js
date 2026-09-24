import colors from "picocolors";

import app from "./app.js";
import { PORT } from "./util/config.js";
import { connectToDatabase } from "./util/db.js";
import { syncModels } from "./models/index.js";

function listen(app, PORT) {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT);
    server.once("listening", () => {
      resolve(server);
    });
    server.once("error", (error) => {
      reject(error);
    });
  });
}
async function start(PORT) {
  await connectToDatabase();
  await syncModels();
  try {
    await listen(app, PORT);
    console.log(colors.yellow(`Server listening at http://localhost:${PORT}`));
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} already in use.`);
      listen(app, PORT + 1);
      return;
    }
  }
}

start(PORT);
