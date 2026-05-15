import pino from "pino";

export type Logger = pino.Logger;

export function createLogger(service: string) {
  const level = process.env.LOG_LEVEL || "info";
  return pino({
    level,
    base: {
      service,
    },
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie"],
      censor: "[REDACTED]",
    },
  });
}
