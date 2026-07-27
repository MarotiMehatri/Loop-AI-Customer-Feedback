import logger from "../config/logger.js";

export default async function classificationWorker(
  data: Record<string, unknown>,
): Promise<unknown> {
  logger.info("Running classification worker", data);
  // TODO: Implement feedback classification logic
  return { classified: true };
}
