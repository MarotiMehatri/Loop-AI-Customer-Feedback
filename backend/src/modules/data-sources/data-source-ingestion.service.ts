import type { IngestionRecord } from "./data-source.types.js";

export const dataSourceIngestionService = {
  async ingest(dataSourceId: string): Promise<IngestionRecord> {
    return {
      id: crypto.randomUUID(),
      dataSourceId,
      status: "completed",
      recordsProcessed: 0,
      recordsFailed: 0,
      startedAt: new Date(),
      completedAt: new Date(),
    };
  },
};
