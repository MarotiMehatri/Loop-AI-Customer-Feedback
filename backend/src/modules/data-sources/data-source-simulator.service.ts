import type { SimulatorConfig } from "./data-source.types.js";

export const dataSourceSimulatorService = {
  async simulate(config: SimulatorConfig): Promise<number> {
    const batchSize = Math.min(config.maxRecords, 100);

    return batchSize;
  },

  getDefaultSchema(sourceType: string): Record<string, unknown> {
    switch (sourceType) {
      case "SOCIAL_MEDIA":
        return {
          content: "string",
          author: "string",
          platform: "string",
          timestamp: "date",
        };
      case "API":
        return {
          endpoint: "string",
          method: "string",
          payload: "object",
        };
      case "CSV":
        return {
          columns: "string[]",
          delimiter: "string",
          hasHeader: "boolean",
        };
      default:
        return {
          data: "unknown",
        };
    }
  },
};
