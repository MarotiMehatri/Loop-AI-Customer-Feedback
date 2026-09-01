import { apiClient } from "../../../lib/api/api-client";

import type {
  CreateExportPayload,
  ExportDashboardResponse,
  ExportDownloadResponse,
  ExportJob,
  ExportListParams,
} from "../exports.types";

/* -------------------------------------------------------------------------- */
/* Backend export types                                                       */
/* -------------------------------------------------------------------------- */

/*
 * IMPORTANT
 *
 * Backend validation expects:
 *
 * feedback
 * analytics
 * themes
 * reports
 *
 * NOT:
 *
 * FEEDBACK
 * ANALYTICS
 * THEMES
 * REPORTS
 */

export type BackendExportType =
  | "feedback"
  | "analytics"
  | "themes"
  | "reports";

export type BackendExportFormat =
  | "CSV"
  | "XLSX"
  | "JSON"
  | "PDF";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function cleanParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "ALL",
    ),
  );
}

/**
 * Converts old frontend values into the exact values
 * expected by the exports backend validator.
 */
function normalizeExportType(
  value: unknown,
): BackendExportType {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "feedback":
    case "feedback_data":
    case "feedback-data":
      return "feedback";

    case "analytics":
    case "analytic":
      return "analytics";

    case "themes":
    case "theme":
      return "themes";

    case "reports":
    case "report":
      return "reports";

    default:
      throw new Error(
        `Invalid export type "${String(
          value,
        )}". Expected feedback, analytics, themes, or reports.`,
      );
  }
}

/**
 * Backend ExportFormat is uppercase according to the Prisma schema:
 *
 * CSV
 * XLSX
 * JSON
 * PDF
 */
function normalizeExportFormat(
  value: unknown,
): BackendExportFormat {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "CSV":
      return "CSV";

    case "XLSX":
    case "XLS":
      return "XLSX";

    case "JSON":
      return "JSON";

    case "PDF":
      return "PDF";

    default:
      throw new Error(
        `Invalid export format "${String(
          value,
        )}". Expected CSV, XLSX, JSON, or PDF.`,
      );
  }
}

/**
 * Converts date values to ISO safely.
 *
 * Accepts:
 * - 2026-08-01
 * - 2026-08-01T00:00:00
 * - Date
 * - ISO string
 */
function normalizeDate(
  value: unknown,
  endOfDay = false,
): string | undefined {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid export date.");
    }

    return value.toISOString();
  }

  const raw = String(value).trim();

  if (!raw) {
    return undefined;
  }

  /*
   * HTML date input:
   *
   * 2026-08-31
   *
   * Convert it to local date/time first.
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(raw)
  ) {
    const date = new Date(
      `${raw}T${
        endOfDay
          ? "23:59:59.999"
          : "00:00:00.000"
      }`,
    );

    if (Number.isNaN(date.getTime())) {
      throw new Error(
        `Invalid export date: ${raw}`,
      );
    }

    return date.toISOString();
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid export date: ${raw}`,
    );
  }

  return date.toISOString();
}

/* -------------------------------------------------------------------------- */
/* List exports                                                               */
/* -------------------------------------------------------------------------- */

export async function listExports(
  params: ExportListParams = {},
): Promise<ExportDashboardResponse> {
  const response = await apiClient.get(
    "/exports",
    {
      params: cleanParams(
        params as Record<string, unknown>,
      ),
    },
  );

  return response.data;
}

/* -------------------------------------------------------------------------- */
/* Create export                                                              */
/* -------------------------------------------------------------------------- */

export async function createExport(
  payload: CreateExportPayload,
): Promise<ExportJob> {
  try {
    /*
     * Normalize EVERYTHING before sending it.
     *
     * This is the important fix for:
     *
     * Invalid option: expected one of
     * "feedback"|"analytics"|"themes"|"reports"
     */
    const normalizedType =
      normalizeExportType(
        (payload as any).type,
      );

    const normalizedFormat =
      normalizeExportFormat(
        (payload as any).format,
      );

    const normalizedPayload = {
      name: String(
        (payload as any).name ?? "",
      ).trim(),

      type: normalizedType,

      format: normalizedFormat,

      filters:
        (payload as any).filters &&
        typeof (payload as any).filters ===
          "object"
          ? (payload as any).filters
          : {},

      startDate: normalizeDate(
        (payload as any).startDate,
        false,
      ),

      endDate: normalizeDate(
        (payload as any).endDate,
        true,
      ),
    };

    if (!normalizedPayload.name) {
      throw new Error(
        "Export name is required.",
      );
    }

    /*
     * Do not send undefined properties.
     */
    const requestBody = Object.fromEntries(
      Object.entries(
        normalizedPayload,
      ).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null,
      ),
    );

    console.log(
      "[EXPORT] FINAL REQUEST BODY:",
      JSON.stringify(
        requestBody,
        null,
        2,
      ),
    );

    const response =
      await apiClient.post(
        "/exports",
        requestBody,
      );

    console.log(
      "[EXPORT] CREATE SUCCESS:",
      response.data,
    );

    /*
     * Different backend implementations may return:
     *
     * {
     *   export: {...}
     * }
     *
     * or:
     *
     * {...}
     */
    return (
      response.data?.export ??
      response.data?.job ??
      response.data
    );
  } catch (error: any) {
    const status =
      error?.response?.status;

    const backendData =
      error?.response?.data;

    console.error(
      "[EXPORT] CREATE FAILED",
    );

    console.error(
      "[EXPORT] Status:",
      status,
    );

    console.error(
      "[EXPORT] Backend response:",
      backendData,
    );

    /*
     * Extract the useful backend validation error.
     */
    const backendMessage =
      backendData?.message;

    const backendErrors =
      backendData?.errors;

    let message =
      backendMessage ||
      error?.message ||
      "Failed to create export.";

    /*
     * If backend returns:
     *
     * errors: [
     *   {
     *     message: "..."
     *   }
     * ]
     *
     * show that message.
     */
    if (
      Array.isArray(
        backendErrors,
      ) &&
      backendErrors.length > 0
    ) {
      const firstError =
        backendErrors[0];

      if (
        typeof firstError ===
        "string"
      ) {
        message = firstError;
      } else if (
        firstError?.message
      ) {
        message =
          firstError.message;
      } else if (
        firstError?.path &&
        firstError?.message
      ) {
        message = `${firstError.path}: ${firstError.message}`;
      }
    }

    const finalError =
      new Error(message);

    /*
     * Preserve useful Axios information.
     */
    (finalError as any).status =
      status;

    (finalError as any).response =
      backendData;

    throw finalError;
  }
}

/* -------------------------------------------------------------------------- */
/* Download export                                                            */
/* -------------------------------------------------------------------------- */

export async function downloadExport(
  id: string,
): Promise<ExportDownloadResponse> {
  if (!id) {
    throw new Error(
      "Export ID is required.",
    );
  }

  const response =
    await apiClient.get(
      `/exports/${encodeURIComponent(
        id,
      )}/download`,
    );

  return response.data;
}

/* -------------------------------------------------------------------------- */
/* Delete export                                                              */
/* -------------------------------------------------------------------------- */

export async function deleteExport(
  id: string,
): Promise<void> {
  if (!id) {
    throw new Error(
      "Export ID is required.",
    );
  }

  await apiClient.delete(
    `/exports/${encodeURIComponent(
      id,
    )}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Retry export                                                               */
/* -------------------------------------------------------------------------- */

export async function retryExport(
  id: string,
): Promise<ExportJob> {
  if (!id) {
    throw new Error(
      "Export ID is required.",
    );
  }

  const response =
    await apiClient.post(
      `/exports/${encodeURIComponent(
        id,
      )}/retry`,
    );

  return (
    response.data?.export ??
    response.data?.job ??
    response.data
  );
}