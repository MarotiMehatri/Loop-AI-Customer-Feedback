const level = process.env.NODE_ENV === "production" ? "warn" : "debug";
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[level as keyof typeof LEVELS] ?? 2;

function log(lvl: string, ...args: unknown[]) {
  if ((LEVELS[lvl as keyof typeof LEVELS] ?? 0) <= currentLevel) {
    const ts = new Date().toISOString();
    console[lvl === "error" ? "error" : lvl === "warn" ? "warn" : "log"](`[${ts}] [${lvl.toUpperCase()}]`, ...args);
  }
}

export const logger = {
  error: (...args: unknown[]) => log("error", ...args),
  warn: (...args: unknown[]) => log("warn", ...args),
  info: (...args: unknown[]) => log("info", ...args),
  debug: (...args: unknown[]) => log("debug", ...args),
};
