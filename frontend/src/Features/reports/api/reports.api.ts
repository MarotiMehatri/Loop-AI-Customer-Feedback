import { apiClient } from "../../../lib/api/api-client";
import type {
  CreateReportPayload,
  Report,
  ReportListResponse,
} from "../reports.types";

function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

export async function listReports(): Promise<ReportListResponse> {
  const response = await apiClient.get("/reports");
  const body = unwrap<ReportListResponse | Report[]>(response.data);

  if (Array.isArray(body)) {
    return { reports: body, total: body.length };
  }

  return {
    reports: Array.isArray(body?.reports) ? body.reports : [],
    total: Number(body?.total ?? body?.reports?.length ?? 0),
    page: body?.page,
    limit: body?.limit,
  };
}

export async function getReport(id: string): Promise<Report> {
  const response = await apiClient.get(`/reports/${id}`);
  return unwrap<Report>(response.data);
}

export async function createReport(
  payload: CreateReportPayload,
): Promise<Report> {
  const response = await apiClient.post("/reports", payload);
  return unwrap<Report>(response.data);
}

export async function deleteReport(id: string): Promise<void> {
  await apiClient.delete(`/reports/${id}`);
}

export async function exportReport(
  id: string,
  format: "PDF" | "CSV" | "XLSX" = "PDF",
): Promise<unknown> {
  const response = await apiClient.post(`/reports/${id}/export`, { format });
  return response.data;
}
