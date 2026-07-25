import { ReportStatus } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

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

export const reportService = {
  async create(workspaceId: string, userId: string, input: CreateReportInput) {
    const report = await reportRepository.create(workspaceId, userId, {
      ...input,
      tags: normalizeTags(input.tags),
    });

    reportCache.deleteWorkspace(workspaceId);

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

    return mapReport(updated);
  },

  async delete(reportId: string, workspaceId: string): Promise<void> {
    const result = await reportRepository.delete(reportId, workspaceId);

    if (result.count === 0) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    reportCache.deleteWorkspace(workspaceId);
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

  async generate(reportId: string, workspaceId: string) {
    const generated = await generateReport(reportId, workspaceId);

    if (!generated) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    return mapReport(generated);
  },

  async export(
    reportId: string,
    workspaceId: string,
    format: ReportExportFormat,
  ) {
    const report = await reportRepository.findById(reportId, workspaceId);

    if (!report) {
      throw new ApiError(404, REPORT_MESSAGES.notFound);
    }

    if (report.status !== ReportStatus.COMPLETED) {
      throw new ApiError(400, "Only completed reports can be exported");
    }

    return exportReport(report, format);
  },

  async schedule(
    reportId: string,
    workspaceId: string,
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

    return mapReport(report);
  },
};
