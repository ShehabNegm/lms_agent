const fs = require("fs");
const path = require("path");

const date = new Date().toISOString().slice(0, 10);
const logDir = path.join(__dirname, "../logs");
const logPath = path.join(logDir, `lms_log_${date}.txt`);

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logPath, line);
  console.log(message);
}

module.exports = log;

