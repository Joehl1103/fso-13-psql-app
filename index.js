import config from "./src/util/config.ts";
const PORT = config.PORT;
import { start } from "./src/server.js";

start(PORT);
