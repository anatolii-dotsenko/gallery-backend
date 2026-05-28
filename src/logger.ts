import winston from "winston";

/**
 * Конфігурація професійного логера з використанням Winston.
 * Підтримує запис у файл (асинхронно) та вивід у консоль.
 */
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "server.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// old func for compatibility: todo
export function log(message: string): void {
  logger.info(message);
}
