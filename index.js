import colors from "picocolors";

import app from "./app.js";
import { PORT } from "./util/config.js";
import { connectToDatabase } from "./util/db.js";
import { syncModels } from "./models/index.js";

const start = async (PORT) => {
  try {
    await connectToDatabase();
    await syncModels();
    app.listen(PORT, (error) => {
      console.log(colors.yellow(`Attempting to connect on port ${PORT}`));
      if (error) {
        if (error.code === "EADDRINUSE") {
          console.warn(`Port ${PORT} already in use.`);
          start(PORT + 1);
          return;
        }
        throw error;
      }
      console.log(
        colors.yellow(`Server listening at http://localhost:${PORT}`),
      );
    });
  } catch (error) {
    if (/Sequelize/.test(error.name)) {
      console.log({
        name: error.name,
        code: error.code,
        parent: error.parent,
        sql: error.sql,
      });
    }
    console.error(error.message);
  }
};

start(PORT);
