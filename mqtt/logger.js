const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'engine.log');

function write(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  
  console.log(line); // 👈 IMPORTANT : affichage console

  fs.appendFileSync(logFile, line + '\n');
}

module.exports = {
  info: (msg) => write('INFO', msg),
  error: (msg) => write('ERROR', msg),
  warn: (msg) => write('WARN', msg)
};