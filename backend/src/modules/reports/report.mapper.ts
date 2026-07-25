import type { Report } from "../../generated/prisma/client.js";

export function mapReport(report: Report) {
  return {
    id: report.id,
    title: report.title,
    description: report.description,
    type: report.type,
    status: report.status,

    sources: report.sources,
    filters: report.filters,
    metrics: report.metrics,
    charts: report.charts,
    data: report.data,

    aiSummary: report.aiSummary,
    tags: report.tags,

    startDate: report.startDate,
    endDate: report.endDate,
    generatedAt: report.generatedAt,
    scheduledAt: report.scheduledAt,

    workspaceId: report.workspaceId,
    createdById: report.userId,

    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

export function mapReportList(reports: Report[]) {
  return reports.map(mapReport);
}
