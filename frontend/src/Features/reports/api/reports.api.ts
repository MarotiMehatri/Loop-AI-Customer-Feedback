import { apiClient } from "../../../lib/api/api-client";
import type {
  CreateReportPayload,
  Report,
  ReportListResponse,
} from "../reports.types";

/* ============================================================================
   TYPES
============================================================================ */

export type ReportExportFormat = "PDF" | "CSV" | "XLSX";

export interface UpdateReportPayload {
  title?: string;
  description?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sources?: string[];
  filters?: Record<string, unknown>;
  metrics?: string[];
  charts?: Record<string, unknown>;
  tags?: string[];
  scheduledAt?: string;
}

export interface ReportExportResponse {
  id?: string;
  format?: ReportExportFormat;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  downloadedAt?: string | null;
  createdAt?: string;
}

/* ============================================================================
   HELPERS
============================================================================ */

/**
 * Supports backend responses such as:
 *
 * { data: {...} }
 *
 * or:
 *
 * {...}
 */
function unwrapData<T>(payload: unknown): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    const data = (
      payload as {
        data?: unknown;
      }
    ).data;

    if (data !== undefined) {
      return data as T;
    }
  }

  return payload as T;
}

/**
 * Convert backend/Axios errors into a readable message.
 */
function getApiErrorMessage(
  error: any,
  fallback = "Something went wrong.",
): string {
  const responseData = error?.response?.data;

  if (!responseData) {
    return error?.message || fallback;
  }

  if (typeof responseData === "string") {
    return responseData.trim() || fallback;
  }

  if (typeof responseData === "object") {
    const message = responseData.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (Array.isArray(message)) {
      return message
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          return (
            item?.message ??
            item?.msg ??
            JSON.stringify(item)
          );
        })
        .join(", ");
    }

    const errors = responseData.errors;

    if (Array.isArray(errors) && errors.length > 0) {
      return errors
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.message) {
            return item.message;
          }

          if (item?.msg) {
            return item.msg;
          }

          if (item?.path && item?.message) {
            return `${item.path}: ${item.message}`;
          }

          return JSON.stringify(item);
        })
        .join(" | ");
    }

    if (errors && typeof errors === "object") {
      return Object.entries(errors)
        .map(([field, value]) => {
          if (Array.isArray(value)) {
            return `${field}: ${value.join(", ")}`;
          }

          return `${field}: ${String(value)}`;
        })
        .join(" | ");
    }

    if (responseData.error) {
      if (typeof responseData.error === "string") {
        return responseData.error;
      }

      return JSON.stringify(responseData.error);
    }

    if (responseData.detail) {
      return String(responseData.detail);
    }

    return JSON.stringify(responseData);
  }

  return error?.message || fallback;
}

/**
 * Normalize list response.
 */
function normalizeReportList(
  payload: unknown,
): ReportListResponse {
  const data = unwrapData<any>(payload);

  if (Array.isArray(data)) {
    return {
      reports: data,
      total: data.length,
    };
  }

  const reports = Array.isArray(data?.reports)
    ? data.reports
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return {
    reports,
    total: Number(
      data?.total ??
        data?.count ??
        reports.length,
    ),
    page:
      data?.page !== undefined
        ? Number(data.page)
        : undefined,
    limit:
      data?.limit !== undefined
        ? Number(data.limit)
        : undefined,
  };
}

/**
 * Empty strings should not be sent as meaningful optional values.
 */
function optionalString(
  value?: string | null,
): string | undefined {
  const trimmed = value?.trim() ?? "";

  return trimmed.length > 0
    ? trimmed
    : undefined;
}

/**
 * Remove undefined properties from an object.
 */
function removeUndefined(
  object: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined,
    ),
  );
}

/**
 * Normalize ISO date strings.
 */
function normalizeDate(
  value?: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid report date: ${value}`,
    );
  }

  return date.toISOString();
}

/* ============================================================================
   GET REPORTS
============================================================================ */

export async function listReports(): Promise<ReportListResponse> {
  try {
    const response = await apiClient.get("/reports");

    return normalizeReportList(
      response.data,
    );
  } catch (error: unknown) {
    console.error(
      "[Reports API] listReports failed:",
      (error as any)?.response?.data ?? error,
    );

    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to load reports.",
      ),
    );
  }
}

/**
 * Alias used by pages that expect getReports().
 */
export async function getReports(): Promise<ReportListResponse> {
  return listReports();
}

/* ============================================================================
   GET SINGLE REPORT
============================================================================ */

export async function getReport(
  id: string,
): Promise<Report> {
  if (!id?.trim()) {
    throw new Error(
      "Report ID is required.",
    );
  }

  try {
    const response = await apiClient.get(
      `/reports/${encodeURIComponent(id)}`,
    );

    return unwrapData<Report>(
      response.data,
    );
  } catch (error: unknown) {
    console.error(
      "[Reports API] getReport failed:",
      (error as any)?.response?.data ?? error,
    );

    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to load the report.",
      ),
    );
  }
}

/* ============================================================================
   CREATE REPORT
============================================================================ */

export async function createReport(
  payload: CreateReportPayload,
): Promise<Report> {
  if (!payload) {
    throw new Error("Report payload is required.");
  }

  if (
    typeof payload.title !== "string" ||
    !payload.title.trim()
  ) {
    throw new Error("Report name is required.");
  }

  if (
    typeof payload.type !== "string" ||
    !payload.type.trim()
  ) {
    throw new Error("Report type is required.");
  }

  const requestBody: Record<string, unknown> = {
    title: payload.title.trim(),
    type: payload.type,
  };

  if (
    typeof payload.description === "string" &&
    payload.description.trim()
  ) {
    requestBody.description =
      payload.description.trim();
  }

  if (payload.startDate) {
    requestBody.startDate = payload.startDate;
  }

  if (payload.endDate) {
    requestBody.endDate = payload.endDate;
  }

  if (
    Array.isArray(payload.sources) &&
    payload.sources.length > 0
  ) {
    requestBody.sources = payload.sources;
  }

  if (
    Array.isArray(payload.metrics) &&
    payload.metrics.length > 0
  ) {
    requestBody.metrics = payload.metrics;
  }

  /*
   * Only send scheduledAt when the user
   * explicitly schedules the report.
   */
  if (payload.scheduledAt) {
    requestBody.scheduledAt =
      payload.scheduledAt;
  }

  try {
    console.log(
      "========== CREATE REPORT ==========",
    );

    console.log(
      "[Reports API] POST /reports",
    );

    console.log(
      "[Reports API] Request:",
      JSON.stringify(
        requestBody,
        null,
        2,
      ),
    );

    const response = await apiClient.post(
      "/reports",
      requestBody,
    );

    console.log(
      "[Reports API] Response:",
      response.data,
    );

    const report =
      unwrapData<Report>(
        response.data,
      );

    if (!report) {
      throw new Error(
        "The server created the report but returned an empty response.",
      );
    }

    return report;
  } catch (error: any) {
    const responseData =
      error?.response?.data;

    console.error(
      "========== CREATE REPORT FAILED ==========",
    );

    console.error(
      "[Reports API] Status:",
      error?.response?.status,
    );

    console.error(
      "[Reports API] Server response:",
      responseData,
    );

    console.error(
      "[Reports API] Validation errors:",
      JSON.stringify(
        responseData?.errors ?? responseData,
        null,
        2,
      ),
    );

    console.error(
      "[Reports API] Request:",
      error?.config?.data,
    );

    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to create report.",
      ),
    );
  }
}

/* ============================================================================
   UPDATE REPORT
============================================================================ */

export async function updateReport(
  id: string,
  payload: UpdateReportPayload,
): Promise<Report> {
  if (!id?.trim()) {
    throw new Error(
      "Report ID is required.",
    );
  }

  if (!payload) {
    throw new Error(
      "Update payload is required.",
    );
  }

  const requestBody: Record<string, unknown> =
    removeUndefined({
      title:
        payload.title !== undefined
          ? payload.title.trim()
          : undefined,

      description:
        payload.description !== undefined
          ? optionalString(
              payload.description,
            )
          : undefined,

      type:
        payload.type !== undefined
          ? payload.type
          : undefined,

      status:
        payload.status !== undefined
          ? payload.status
          : undefined,

      startDate:
        payload.startDate !== undefined
          ? normalizeDate(
              payload.startDate,
            )
          : undefined,

      endDate:
        payload.endDate !== undefined
          ? normalizeDate(
              payload.endDate,
            )
          : undefined,

      sources:
        payload.sources !== undefined
          ? payload.sources.filter(Boolean)
          : undefined,

      filters:
        payload.filters !== undefined
          ? payload.filters
          : undefined,

      metrics:
        payload.metrics !== undefined
          ? payload.metrics.filter(Boolean)
          : undefined,

      charts:
        payload.charts !== undefined
          ? payload.charts
          : undefined,

      tags:
        payload.tags !== undefined
          ? payload.tags.filter(Boolean)
          : undefined,

      scheduledAt:
        payload.scheduledAt !== undefined
          ? normalizeDate(
              payload.scheduledAt,
            )
          : undefined,
    });

  try {
    const response =
      await apiClient.patch(
        `/reports/${encodeURIComponent(id)}`,
        requestBody,
      );

    return unwrapData<Report>(
      response.data,
    );
  } catch (error: unknown) {
    console.error(
      "[Reports API] updateReport failed:",
      (error as any)?.response?.data ?? error,
    );

    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to update report.",
      ),
    );
  }
}

/* ============================================================================
   DELETE REPORT
============================================================================ */

export async function deleteReport(
  id: string,
): Promise<void> {
  if (!id?.trim()) {
    throw new Error(
      "Report ID is required.",
    );
  }

  try {
    await apiClient.delete(
      `/reports/${encodeURIComponent(id)}`,
    );
  } catch (error: unknown) {
    console.error(
      "[Reports API] deleteReport failed:",
      (error as any)?.response?.data ?? error,
    );

    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to delete report.",
      ),
    );
  }
}

/* ============================================================================
   EXPORT REPORT
============================================================================ */

export async function exportReport(
  id: string,
  format: ReportExportFormat = "PDF",
): Promise<
  ReportExportResponse | unknown
> {
  if (!id?.trim()) {
    throw new Error(
      "Report ID is required.",
    );
  }

  try {
    const response =
      await apiClient.post(
        `/reports/${encodeURIComponent(id)}/export`,
        {
          format,
        },
      );

    return unwrapData<
      ReportExportResponse | unknown
    >(response.data);
  } catch (error: unknown) {
    console.error(
      "[Reports API] exportReport failed:",
      (error as any)?.response?.data ?? error,
    );

    throw new Error(
      getApiErrorMessage(
        error,
        "Failed to export report.",
      ),
    );
  }
}

/* ============================================================================
   GENERATE REPORT
============================================================================ */

export async function generateReport(
  payload: CreateReportPayload,
): Promise<Report> {
  return createReport(payload);
}

/* ============================================================================
   SCHEDULE REPORT
============================================================================ */

export async function scheduleReport(
  payload: CreateReportPayload,
): Promise<Report> {
  if (!payload?.scheduledAt) {
    throw new Error(
      "scheduledAt is required for a scheduled report.",
    );
  }

  return createReport({
    ...payload,
    scheduledAt:
      normalizeDate(
        payload.scheduledAt,
      ),
  });
}

/* ============================================================================
   DEFAULT EXPORT
============================================================================ */

const reportsApi = {
  listReports,
  getReports,
  getReport,
  createReport,
  generateReport,
  scheduleReport,
  updateReport,
  deleteReport,
  exportReport,
};

export default reportsApi;