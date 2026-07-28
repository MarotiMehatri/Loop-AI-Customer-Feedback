import type { ExportJob } from "./export.types.js";

export const exportGeneratorService = {
  async generate(
    exportJob: ExportJob,
    workspaceId: string,
  ): Promise<{ fileName: string; buffer: Buffer; fileSize: number }> {
    const fileName = `${exportJob.id}-${Date.now()}.${exportJob.format.toLowerCase()}`;

    const content = JSON.stringify(
      {
        exportId: exportJob.id,
        type: exportJob.type,
        format: exportJob.format,
        filters: exportJob.filters,
        workspaceId,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    );

    const buffer = Buffer.from(content, "utf-8");

    return { fileName, buffer, fileSize: buffer.length };
  },
};
