import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Remplacement de __filename et __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDir = path.join(__dirname, "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, "engine.log");

function write(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;

  console.log(line);

  fs.appendFileSync(logFile, line + "\n");
}

const logger = {
  info: (msg) => write("INFO", msg),
  error: (msg) => write("ERROR", msg),
  warn: (msg) => write("WARN", msg),
};

export default logger;