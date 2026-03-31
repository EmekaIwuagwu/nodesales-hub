const { createLogger, format, transports } = require("winston");

const loggerTransports = [
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    ),
  }),
];

// File transports only in local dev — Vercel's filesystem is read-only
if (process.env.NODE_ENV !== "production") {
  try {
    const fs = require("fs");
    if (!fs.existsSync("logs")) fs.mkdirSync("logs");
    loggerTransports.push(new transports.File({ filename: "logs/error.log", level: "error" }));
    loggerTransports.push(new transports.File({ filename: "logs/combined.log" }));
  } catch {}
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: loggerTransports,
});

module.exports = logger;
