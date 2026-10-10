import app from "./app.js";
import { connectToDatabase } from "./util/db.ts";
import { syncModels } from "./models/index.ts";
import path from "path";
const filename = path.basename(import.meta.filename);
import colors from "picocolors";

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

async function listenOrIncrement(app, port, i) {
  try {
    console.log(
      `${filename} || attempt ${i} || attempting to connect at port: ${port}`,
    );
    const server = await listen(app, port);
    console.log(
      colors.yellow(
        `${filename} || attempt ${i} || server listening at http://localhost:${port}`,
      ),
    );
    return server;
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.warn(
        `${filename} || err || attempt ${i} || port ${port} already in use.`,
      );
      return await listenOrIncrement(app, port + 1, i + 1);
    }
    console.log(error);
    throw error;
  }
}

async function start(PORT) {
  await connectToDatabase();
  await syncModels();
  await testModelInitialization();
  await listenOrIncrement(app, PORT, 1);
}

export { start, listenOrIncrement };
