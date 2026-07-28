import type { ExportStatus } from "./export.types.js";

export const exportStatusService = {
  isValidTransition(
    current: ExportStatus,
    next: ExportStatus,
  ): boolean {
    const transitions: Record<ExportStatus, ExportStatus[]> = {
      PENDING: ["PROCESSING", "FAILED"],
      PROCESSING: ["COMPLETED", "FAILED"],
      COMPLETED: [],
      FAILED: [],
    };

    return transitions[current]?.includes(next) ?? false;
  },
};
