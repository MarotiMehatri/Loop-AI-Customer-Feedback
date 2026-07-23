import * as reportRepo from "../repositories/report.repository.js";
import { getStartDate, getEndDate } from "../utils/dateRange.js";
import { ApiError } from "../utils/apiError.js";

type ReportType =
  | "shipment"
  | "courier"
  | "customer"
  | "delivery"
  | "employee";

export async function generateReport(
  workspaceId: string,
  type: ReportType,
  startDate?: string,
  endDate?: string,
  filters?: Record<string, unknown>,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  let reportData: unknown;

  switch (type) {
    case "shipment":
      reportData = await reportRepo.getShipmentReportData(workspaceId, start, end, filters);
      break;
    case "courier":
      reportData = await reportRepo.getCourierReportData(workspaceId, start, end, filters);
      break;
    case "customer":
      reportData = await reportRepo.getCustomerReportData(workspaceId, start, end, filters);
      break;
    case "delivery":
      reportData = await reportRepo.getDeliveryReportData(workspaceId, start, end, filters);
      break;
    case "employee":
      reportData = await reportRepo.getEmployeeReportData(workspaceId, start, end, filters);
      break;
    default:
      throw new ApiError(400, `Invalid report type: ${type}`);
  }

  const report = await reportRepo.saveReport({
    workspaceId,
    type,
    startDate: start ?? new Date(),
    endDate: end ?? new Date(),
    filters: filters ?? null,
    data: reportData,
  });

  return report;
}

export async function getShipmentReport(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  status?: string,
  courierId?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [summary, shipments, statusTrend] = await Promise.all([
    reportRepo.getShipmentReportSummary(workspaceId, start, end, status, courierId),
    reportRepo.getShipmentReportDetails(workspaceId, start, end, status, courierId),
    reportRepo.getShipmentStatusTrend(workspaceId, start, end, status, courierId),
  ]);

  return {
    summary,
    shipments,
    statusTrend,
    period: { start, end },
  };
}

export async function getCourierReport(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  courierId?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [summary, courierPerformance, deliveryMetrics] = await Promise.all([
    reportRepo.getCourierReportSummary(workspaceId, start, end, courierId),
    reportRepo.getCourierPerformanceDetails(workspaceId, start, end, courierId),
    reportRepo.getCourierDeliveryMetrics(workspaceId, start, end, courierId),
  ]);

  return {
    summary,
    courierPerformance,
    deliveryMetrics,
    period: { start, end },
  };
}

export async function getCustomerReport(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  customerId?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [summary, customerDetails, orderHistory] = await Promise.all([
    reportRepo.getCustomerReportSummary(workspaceId, start, end, customerId),
    reportRepo.getCustomerReportDetails(workspaceId, start, end, customerId),
    reportRepo.getCustomerOrderHistory(workspaceId, start, end, customerId),
  ]);

  return {
    summary,
    customerDetails,
    orderHistory,
    period: { start, end },
  };
}

export async function getDeliveryReport(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  status?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [summary, deliveryDetails, failureAnalysis] = await Promise.all([
    reportRepo.getDeliveryReportSummary(workspaceId, start, end, status),
    reportRepo.getDeliveryReportDetails(workspaceId, start, end, status),
    reportRepo.getDeliveryFailureAnalysis(workspaceId, start, end, status),
  ]);

  return {
    summary,
    deliveryDetails,
    failureAnalysis,
    period: { start, end },
  };
}

export async function getEmployeeReport(
  workspaceId: string,
  startDate?: string,
  endDate?: string,
  employeeId?: string,
) {
  const start = getStartDate(startDate);
  const end = getEndDate(endDate);

  const [summary, employeePerformance, taskBreakdown] = await Promise.all([
    reportRepo.getEmployeeReportSummary(workspaceId, start, end, employeeId),
    reportRepo.getEmployeePerformanceDetails(workspaceId, start, end, employeeId),
    reportRepo.getEmployeeTaskBreakdown(workspaceId, start, end, employeeId),
  ]);

  return {
    summary,
    employeePerformance,
    taskBreakdown,
    period: { start, end },
  };
}

export async function exportPdf(workspaceId: string, reportId: string) {
  const report = await reportRepo.getReportById(reportId, workspaceId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  return report;
}

export async function exportExcel(workspaceId: string, reportId: string) {
  const report = await reportRepo.getReportById(reportId, workspaceId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  return report;
}

export async function getHistory(workspaceId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    reportRepo.getReportHistory(workspaceId, skip, limit),
    reportRepo.countReports(workspaceId),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function deleteReport(workspaceId: string, reportId: string) {
  const report = await reportRepo.getReportById(reportId, workspaceId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  await reportRepo.deleteReport(reportId, workspaceId);
}
