import app from "./app.js";
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
    console.log(`Attempting to connect at port: ${PORT}`);
    await listen(app, PORT);
    console.log(colors.yellow(`Server listening at http://localhost:${PORT}`));
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.warn(`Port ${PORT} already in use.`);
      await listen(app, PORT + 1);
      return;
    }
  }
}

export { start, listen };
