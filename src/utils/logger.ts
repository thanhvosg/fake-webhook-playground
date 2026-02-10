import { env } from "../config/env";

export const logger = {
  error: (msg: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: "error", message: msg, ...meta, timestamp: new Date().toISOString() }));
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    if (["warn", "info", "debug"].includes(env.LOG_LEVEL)) {
      console.warn(JSON.stringify({ level: "warn", message: msg, ...meta, timestamp: new Date().toISOString() }));
    }
  },
  info: (msg: string, meta?: Record<string, unknown>) => {
    if (["info", "debug"].includes(env.LOG_LEVEL)) {
      console.log(JSON.stringify({ level: "info", message: msg, ...meta, timestamp: new Date().toISOString() }));
    }
  },
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (env.LOG_LEVEL === "debug") {
      console.log(JSON.stringify({ level: "debug", message: msg, ...meta, timestamp: new Date().toISOString() }));
    }
  },
};
