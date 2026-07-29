import { ActivityType, ReportStatus } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/apiError.js";
import { activityLogger } from "../activity/activity.logger.js";
import { notificationPublisher } from "../notifications/notification.service.js";
import { NotificationType } from "../../generated/prisma/client.js";
import { assertCanCreateReport, assertCanViewReports, assertCanUpdateReport, assertCanDeleteReport, assertCanGenerateReport, assertCanExportReport, assertCanScheduleReport } from "./report.permissions.js";
import { REPORT_MESSAGES, REPORT_CACHE_TTL_MS } from "./report.constants.js";
import { reportRepository } from "./report.repository.js";
import { reportDataService } from "./report-data.service.js";
import { reportGeneratorService } from "./report-generator.service.js";
import { reportRendererService } from "./report-renderer.service.js";
import { reportScheduleService } from "./report-schedule.service.js";
import { mapReport, mapReportList } from "./report.mapper.js";
import type { ReportActorContext, CreateReportInput, ReportExportFormat, ReportListQuery, ReportPreviewInput, ReportScheduleInput, UpdateReportInput } from "./report.types.js";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache {
  private readonly values = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.values.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      this.values.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttl = REPORT_CACHE_TTL_MS): void {
    this.values.set(key, { value, expiresAt: Date.now() + ttl });
  }

  deleteWorkspace(workspaceId: string): void {
    for (const key of this.values.keys()) {
      if (key.includes(workspaceId)) {
        this.values.delete(key);
      }
    }
  }
}

const reportCache = new SimpleCache();

function normalizeTags(tags: string[] = []): string[] {
  return Array.from(
    new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  );
}

async function publishNotification(
  type: NotificationType,
  title: string,
  message: string,
  input: { userId: string; workspaceId: string; reportId: string; reportTitle: string },
  metadata?: Record<string, unknown>,
) {
  try {
    await notificationPublisher.publishSafe({
      userId: input.userId,
      workspaceId: input.workspaceId,
      type,
      title,
      message,
      entityType: "REPORT",
      entityId: input.reportId,
      metadata: { reportTitle: input.reportTitle, ...metadata },
    });
  } catch {
    // notification failure should not break the flow
  }
}

export const reportService = {
  async create(actor: ReportActorContext, input: CreateReportInput) {
    assertCanCreateReport(actor.role);

    const report = await reportRepository.create(actor.workspaceId, actor.userId, {
      ...input,
      tags: normalizeTags(input.tags),
    });

    reportCache.deleteWorkspace(actor.workspaceId);

    await activityLogger.logSafe({
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      type: ActivityType.REPORT_CREATED,
      title: "Report created",
      description: `Report "${report.title}" was created.`,
      entityType: "REPORT",
      entityId: report.id,
      metadata: { status: report.status },
    });

    await publishNotification(
      NotificationType.REPORT_CREATED,
      "Report created",
      `Your report "${report.title}" was created successfully.`,
      { userId: actor.userId, workspaceId: actor.workspaceId, reportId: report.id, reportTitle: report.title },
      { status: String(report.status) },
    );

    return mapReport(report);
  },

  async getById(actor: ReportActorContext, reportId: string) {
    assertCanViewReports(actor.role);

    const report = await reportRepository.findById(reportId, actor.workspaceId);
    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    return mapReport(report);
  },

  async list(actor: ReportActorContext, query: ReportListQuery) {
    assertCanViewReports(actor.role);

    const result = await reportRepository.list(actor.workspaceId, query);

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

  async update(actor: ReportActorContext, reportId: string, input: UpdateReportInput) {
    assertCanUpdateReport(actor.role);

    const updated = await reportRepository.update(reportId, actor.workspaceId, {
      ...input,
      tags: input.tags !== undefined ? normalizeTags(input.tags) : undefined,
    });

    if (!updated) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    reportCache.deleteWorkspace(actor.workspaceId);

    await activityLogger.logSafe({
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      type: ActivityType.REPORT_UPDATED,
      title: "Report updated",
      description: `Report "${updated.title}" was updated.`,
      entityType: "REPORT",
      entityId: updated.id,
      metadata: { updatedFields: Object.keys(input), status: updated.status },
    });

    return mapReport(updated);
  },

  async delete(actor: ReportActorContext, reportId: string): Promise<void> {
    assertCanDeleteReport(actor.role);

    const report = await reportRepository.findById(reportId, actor.workspaceId);
    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    const result = await reportRepository.delete(reportId, actor.workspaceId);
    if (result.count === 0) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    reportCache.deleteWorkspace(actor.workspaceId);

    await activityLogger.logSafe({
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      type: ActivityType.REPORT_DELETED,
      title: "Report deleted",
      description: `Report "${report.title}" was deleted.`,
      entityType: "REPORT",
      entityId: report.id,
      metadata: { previousStatus: report.status },
    });
  },

  async getSummary(actor: ReportActorContext) {
    assertCanViewReports(actor.role);

    const cacheKey = `report-summary:${actor.workspaceId}`;
    const cached = reportCache.get<ReturnType<typeof reportRepository.getDashboardSummary>>(cacheKey);
    if (cached) return cached;

    const summary = await reportRepository.getDashboardSummary(actor.workspaceId);
    reportCache.set(cacheKey, summary);
    return summary;
  },

  async getRecent(actor: ReportActorContext, limit = 5) {
    assertCanViewReports(actor.role);

    const reports = await reportRepository.getRecent(actor.workspaceId, limit);
    return mapReportList(reports);
  },

  async preview(actor: ReportActorContext, input: ReportPreviewInput) {
    assertCanViewReports(actor.role);

    return reportDataService.createPreview(actor.workspaceId, input);
  },

  async generate(actor: ReportActorContext, reportId: string) {
    assertCanGenerateReport(actor.role);

    const existing = await reportRepository.findById(reportId, actor.workspaceId);
    if (!existing) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    try {
      const generated = await reportGeneratorService.generate(reportId, actor.workspaceId);
      if (!generated) {
        throw new ApiError(500, REPORT_MESSAGES.generationFailed);
      }

      reportCache.deleteWorkspace(actor.workspaceId);

      await activityLogger.logSafe({
        userId: actor.userId,
        workspaceId: actor.workspaceId,
        type: ActivityType.REPORT_GENERATED,
        title: "Report generated",
        description: `Report "${generated.title}" was generated successfully.`,
        entityType: "REPORT",
        entityId: generated.id,
        metadata: { status: generated.status, generatedAt: new Date().toISOString() },
      });

      await publishNotification(
        NotificationType.REPORT_COMPLETED,
        "Report completed",
        `Your report "${generated.title}" is ready to view.`,
        { userId: actor.userId, workspaceId: actor.workspaceId, reportId: generated.id, reportTitle: generated.title },
      );

      return mapReport(generated);
    } catch (error) {
      await publishNotification(
        NotificationType.REPORT_FAILED,
        "Report generation failed",
        `Report "${existing.title}" could not be generated.`,
        { userId: actor.userId, workspaceId: actor.workspaceId, reportId: existing.id, reportTitle: existing.title },
      );
      throw error;
    }
  },

  async export(
    actor: ReportActorContext,
    reportId: string,
    format: ReportExportFormat,
  ) {
    assertCanExportReport(actor.role);

    const report = await reportRepository.findById(reportId, actor.workspaceId);
    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    if (report.status !== ReportStatus.COMPLETED) {
      throw new ApiError(400, "Only completed reports can be exported");
    }

    const exported = reportRendererService.exportReport(report, format);

    await activityLogger.logSafe({
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      type: ActivityType.REPORT_EXPORTED,
      title: "Report exported",
      description: `Report "${report.title}" was exported as ${format}.`,
      entityType: "REPORT",
      entityId: report.id,
      metadata: { format },
    });

    await publishNotification(
      NotificationType.REPORT_EXPORTED,
      "Report exported",
      `Report "${report.title}" was exported as ${format}.`,
      { userId: actor.userId, workspaceId: actor.workspaceId, reportId: report.id, reportTitle: report.title },
      { format: String(format), fileName: exported.fileName },
    );

    return exported;
  },

  async schedule(
    actor: ReportActorContext,
    reportId: string,
    input: ReportScheduleInput,
  ) {
    assertCanScheduleReport(actor.role);

    const scheduledAt = input.scheduledAt ?? reportScheduleService.calculateNextRun(input.frequency);

    const report = await reportRepository.update(reportId, actor.workspaceId, {
      scheduledAt,
      status: ReportStatus.SCHEDULED,
    });

    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    reportCache.deleteWorkspace(actor.workspaceId);

    await activityLogger.logSafe({
      userId: actor.userId,
      workspaceId: actor.workspaceId,
      type: ActivityType.REPORT_UPDATED,
      title: "Report scheduled",
      description: `Report "${report.title}" was scheduled.`,
      entityType: "REPORT",
      entityId: report.id,
      metadata: { action: "REPORT_SCHEDULED", frequency: input.frequency, scheduledAt: scheduledAt.toISOString() },
    });

    return mapReport(report);
  },
};
