import logger from "../config/logger.js";

export default async function notificationWorker(
  data: Record<string, unknown>,
): Promise<unknown> {
  logger.info("Running notification worker", data);
  // TODO: Implement notification sending logic
  return { notified: true };
}
