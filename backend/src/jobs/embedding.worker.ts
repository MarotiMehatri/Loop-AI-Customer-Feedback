import logger from "../config/logger.js";

export default async function embeddingWorker(
  data: Record<string, unknown>,
): Promise<unknown> {
  logger.info("Running embedding worker", data);
  // TODO: Implement embedding generation logic
  return { embedded: true };
}
