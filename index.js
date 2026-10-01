import config from "./util/config.ts";
const PORT = config.PORT;
import { start } from "./server.js";

start(PORT);
