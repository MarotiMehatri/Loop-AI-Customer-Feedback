import { ActivityType, ReportStatus } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { activityLogger } from "../activity/activity.logger.js";

import { REPORT_MESSAGES } from "./report.constants.js";

import { reportCache } from "./report.cache.js";

import { exportReport } from "./report.export.js";

import { generateReport } from "./report.generator.js";

import { normalizeTags } from "./report.helper.js";

import { mapReport, mapReportList } from "./report.mapper.js";

import { createReportPreview } from "./report.preview.js";

import { reportRepository } from "./report.repository.js";

import { calculateNextRun } from "./report.scheduler.js";

import type {
  CreateReportInput,
  ReportExportFormat,
  ReportListQuery,
  ReportPreviewInput,
  ReportScheduleInput,
  UpdateReportInput,
} from "./report.types.js";
import { reportNotificationPublisher } from "./report.notification.js";

export const reportService = {
  async create(workspaceId: string, userId: string, input: CreateReportInput) {
    const report = await reportRepository.create(workspaceId, userId, {
      ...input,
      tags: normalizeTags(input.tags),
    });

    reportCache.deleteWorkspace(workspaceId);

    await activityLogger.logSafe({
      userId,
      workspaceId,

      type: ActivityType.REPORT_CREATED,

      title: "Report created",

      description: `Report "${report.title}" was created.`,

      entityType: "REPORT",
      entityId: report.id,

      metadata: {
        status: report.status,
      },
    });

    await reportNotificationPublisher.created({
      userId,
      workspaceId,

      reportId: report.id,
      reportTitle: report.title,

      status: String(report.status),
    });

    return mapReport(report);
  },

  async getById(reportId: string, workspaceId: string) {
    const report = await reportRepository.findById(reportId, workspaceId);

    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    return mapReport(report);
  },

  async list(workspaceId: string, query: ReportListQuery) {
    const result = await reportRepository.list(workspaceId, query);

    return {
      items: mapReportList(result.items),

      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,

        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async update(
    reportId: string,
    workspaceId: string,
    userId: string,
    input: UpdateReportInput,
  ) {
    const updated = await reportRepository.update(reportId, workspaceId, {
      ...input,

      tags: input.tags !== undefined ? normalizeTags(input.tags) : undefined,
    });

    if (!updated) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    reportCache.deleteWorkspace(workspaceId);

    await activityLogger.logSafe({
      userId,
      workspaceId,

      type: ActivityType.REPORT_UPDATED,

      title: "Report updated",

      description: `Report "${updated.title}" was updated.`,

      entityType: "REPORT",
      entityId: updated.id,

      metadata: {
        updatedFields: Object.keys(input),
        status: updated.status,
      },
    });

    return mapReport(updated);
  },

  async delete(
    reportId: string,
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const report = await reportRepository.findById(reportId, workspaceId);

    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    const result = await reportRepository.delete(reportId, workspaceId);

    if (result.count === 0) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    reportCache.deleteWorkspace(workspaceId);

    await activityLogger.logSafe({
      userId,
      workspaceId,

      type: ActivityType.REPORT_DELETED,

      title: "Report deleted",

      description: `Report "${report.title}" was deleted.`,

      entityType: "REPORT",
      entityId: report.id,

      metadata: {
        previousStatus: report.status,
      },
    });
  },

  async getSummary(workspaceId: string) {
    const cacheKey = `report-summary:${workspaceId}`;

    const cached = reportCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const summary = await reportRepository.getDashboardSummary(workspaceId);

    reportCache.set(cacheKey, summary);

    return summary;
  },

  async getRecent(workspaceId: string, limit = 5) {
    const reports = await reportRepository.getRecent(workspaceId, limit);

    return mapReportList(reports);
  },

  async preview(workspaceId: string, input: ReportPreviewInput) {
    return createReportPreview(workspaceId, input);
  },

  async generate(reportId: string, workspaceId: string, userId: string) {
    const existingReport = await reportRepository.findById(
      reportId,
      workspaceId,
    );

    if (!existingReport) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    try {
      const generated = await generateReport(reportId, workspaceId);

      if (!generated) {
        throw new ApiError(500, "Report generation failed");
      }

      reportCache.deleteWorkspace(workspaceId);

      await activityLogger.logSafe({
        userId,
        workspaceId,

        type: ActivityType.REPORT_GENERATED,

        title: "Report generated",

        description: `Report "${generated.title}" was generated successfully.`,

        entityType: "REPORT",
        entityId: generated.id,

        metadata: {
          status: generated.status,

          generatedAt: new Date().toISOString(),
        },
      });

      await reportNotificationPublisher.completed({
        userId,
        workspaceId,

        reportId: generated.id,
        reportTitle: generated.title,
      });

      return mapReport(generated);
    } catch (error) {
      await reportNotificationPublisher.failed({
        userId,
        workspaceId,

        reportId: existingReport.id,
        reportTitle: existingReport.title,
      });

      throw error;
    }
  },

  async export(
    reportId: string,
    workspaceId: string,
    userId: string,
    format: ReportExportFormat,
  ) {
    const report = await reportRepository.findById(reportId, workspaceId);

    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    if (report.status !== ReportStatus.COMPLETED) {
      throw new ApiError(400, "Only completed reports can be exported");
    }

    const exported = await exportReport(report, format);

    await activityLogger.logSafe({
      userId,
      workspaceId,

      type: ActivityType.REPORT_EXPORTED,

      title: "Report exported",

      description: `Report "${report.title}" was exported as ${format}.`,

      entityType: "REPORT",
      entityId: report.id,

      metadata: {
        format,
      },
    });

    await reportNotificationPublisher.exported({
      userId,
      workspaceId,

      reportId: report.id,
      reportTitle: report.title,

      format: String(format),
      fileName: exported.fileName,
    });

    return exported;
  },

  async schedule(
    reportId: string,
    workspaceId: string,
    userId: string,
    input: ReportScheduleInput,
  ) {
    const scheduledAt = input.scheduledAt ?? calculateNextRun(input.frequency);

    const report = await reportRepository.update(reportId, workspaceId, {
      scheduledAt,
      status: ReportStatus.SCHEDULED,
    });

    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    reportCache.deleteWorkspace(workspaceId);

    await activityLogger.logSafe({
      userId,
      workspaceId,

      type: ActivityType.REPORT_UPDATED,

      title: "Report scheduled",

      description: `Report "${report.title}" was scheduled.`,

      entityType: "REPORT",
      entityId: report.id,

      metadata: {
        action: "REPORT_SCHEDULED",
        frequency: input.frequency,
        scheduledAt: scheduledAt.toISOString(),
      },
    });

    return mapReport(report);
  },
};
