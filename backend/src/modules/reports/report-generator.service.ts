import { ReportStatus } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/apiError.js";
import { reportRepository } from "./report.repository.js";
import { reportDataService } from "./report-data.service.js";
import { reportRendererService } from "./report-renderer.service.js";
import type { ReportPreviewInput, GeneratedReportData } from "./report.types.js";

type ProgressStage =
  | "QUEUED" | "COLLECTING_DATA" | "ANALYZING"
  | "GENERATING_SUMMARY" | "SAVING" | "COMPLETED" | "FAILED";
type ProgressCallback = (stage: ProgressStage, progress: number, message: string) => void;

const noopProgress: ProgressCallback = () => {};

export const reportGeneratorService = {
  async generate(
    reportId: string,
    workspaceId: string,
    onProgress: ProgressCallback = noopProgress,
  ) {
    const report = await reportRepository.findById(reportId, workspaceId);
    if (!report) {
      throw new ApiError(404, "Report not found");
    }

    try {
      onProgress("QUEUED", 5, "Report generation started");

      await reportRepository.updateGenerationStatus(reportId, workspaceId, {
        status: ReportStatus.GENERATING,
      });

      onProgress("COLLECTING_DATA", 25, "Collecting feedback data");

      const previewInput: ReportPreviewInput = {
        startDate: report.startDate ?? undefined,
        endDate: report.endDate ?? undefined,
        sources: Array.isArray(report.sources) ? (report.sources as never[]) : [],
        filters: report.filters && typeof report.filters === "object"
          ? (report.filters as never)
          : undefined,
        metrics: Array.isArray(report.metrics) ? (report.metrics as never[]) : [],
        charts: Array.isArray(report.charts) ? (report.charts as never[]) : undefined,
      };

      const preview = await reportDataService.createPreview(workspaceId, previewInput);

      onProgress("GENERATING_SUMMARY", 60, "Generating AI report summary");

      const aiReport = await reportRendererService.generateAIReportContent({
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

      onProgress("SAVING", 90, "Saving generated report");

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

      onProgress("COMPLETED", 100, "Report generated successfully");

      return updatedReport;
    } catch (error) {
      await reportRepository.updateGenerationStatus(reportId, workspaceId, {
        status: ReportStatus.FAILED,
      });

      onProgress(
        "FAILED",
        100,
        error instanceof Error ? error.message : "Report generation failed",
      );

      throw error;
    }
  },
};
