import { ReportStatus } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { reportCache } from "./report.cache.js";

import { generateAIReport } from "./report.ai.js";

import { createReportPreview } from "./report.preview.js";

import { reportRepository } from "./report.repository.js";

import { reportSocket } from "./report.socket.js";

import type {
  GeneratedReportData,
  ReportPreviewInput,
} from "./report.types.js";

function emitProgress(
  reportId: string,
  workspaceId: string,
  stage:
    | "QUEUED"
    | "COLLECTING_DATA"
    | "ANALYZING"
    | "GENERATING_SUMMARY"
    | "SAVING"
    | "COMPLETED"
    | "FAILED",
  progress: number,
  message: string,
): void {
  reportSocket.emitProgress({
    reportId,
    workspaceId,
    stage,
    progress,
    message,
    createdAt: new Date(),
  });
}

export async function generateReport(reportId: string, workspaceId: string) {
  const report = await reportRepository.findById(reportId, workspaceId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  try {
    emitProgress(
      reportId,
      workspaceId,
      "QUEUED",
      5,
      "Report generation started",
    );

    await reportRepository.updateGenerationStatus(reportId, workspaceId, {
      status: ReportStatus.GENERATING,
    });

    emitProgress(
      reportId,
      workspaceId,
      "COLLECTING_DATA",
      25,
      "Collecting feedback data",
    );

    const previewInput: ReportPreviewInput = {
      startDate: report.startDate ?? undefined,

      endDate: report.endDate ?? undefined,

      sources: Array.isArray(report.sources) ? (report.sources as never[]) : [],

      filters:
        report.filters && typeof report.filters === "object"
          ? (report.filters as never)
          : undefined,

      metrics: Array.isArray(report.metrics) ? (report.metrics as never[]) : [],

      charts: Array.isArray(report.charts)
        ? (report.charts as never[])
        : undefined,
    };

    const preview = await createReportPreview(workspaceId, previewInput);

    emitProgress(
      reportId,
      workspaceId,
      "GENERATING_SUMMARY",
      60,
      "Generating AI report summary",
    );

    const aiReport = await generateAIReport({
      title: report.title,
      type: report.type,
      description: report.description,
      startDate: report.startDate,
      endDate: report.endDate,
      preview,
    });

    const generatedData: GeneratedReportData = {
      preview,

      executiveSummary: aiReport.executiveSummary,

      keyFindings: aiReport.keyFindings,

      positiveInsights: aiReport.positiveInsights,

      negativeInsights: aiReport.negativeInsights,

      recommendations: aiReport.recommendations,

      conclusion: aiReport.conclusion,
    };

    emitProgress(
      reportId,
      workspaceId,
      "SAVING",
      90,
      "Saving generated report",
    );

    const updatedReport = await reportRepository.updateGenerationStatus(
      reportId,
      workspaceId,
      {
        status: ReportStatus.COMPLETED,

        data: generatedData,

        aiSummary: aiReport.executiveSummary,

        generatedAt: new Date(),
      },
    );

    reportCache.deleteWorkspace(workspaceId);

    emitProgress(
      reportId,
      workspaceId,
      "COMPLETED",
      100,
      "Report generated successfully",
    );

    return updatedReport;
  } catch (error) {
    await reportRepository.updateGenerationStatus(reportId, workspaceId, {
      status: ReportStatus.FAILED,
    });

    emitProgress(
      reportId,
      workspaceId,
      "FAILED",
      100,
      error instanceof Error ? error.message : "Report generation failed",
    );

    throw error;
  }
}
