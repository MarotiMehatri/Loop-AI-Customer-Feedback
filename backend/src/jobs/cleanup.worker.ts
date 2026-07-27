import logger from "../config/logger.js";

export default async function cleanupWorker(
  data: Record<string, unknown>,
): Promise<unknown> {
  logger.info("Running cleanup worker", data);
  // TODO: Implement cleanup logic
  return { cleaned: true };
}
