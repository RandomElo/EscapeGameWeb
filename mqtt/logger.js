const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'logs', 'engine.log');

function log(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;

  // console
  console.log(line.trim());

  // fichier
  fs.appendFile(logFile, line, (err) => {
    if (err) {
      console.error('Erreur écriture log:', err.message);
    }
  });
}

module.exports = {
  info: (msg) => log('INFO', msg),
  warn: (msg) => log('WARN', msg),
  error: (msg) => log('ERROR', msg)
};
