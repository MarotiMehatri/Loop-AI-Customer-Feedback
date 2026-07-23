import { generateCSV } from "../lib/excel.js";
import { generatePDFReport } from "../lib/pdf.js";
import * as reportRepo from "../repositories/report.repository.js";
import { ApiError } from "../utils/apiError.js";

interface ReportRecord {
  id: string;
  type: string;
  data: unknown;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

interface ShipmentRow {
  trackingNumber: string;
  status: string;
  courier: string;
  customer: string;
  origin: string;
  destination: string;
  shippedAt: string;
  deliveredAt: string;
}

interface CourierRow {
  name: string;
  totalShipments: number;
  delivered: number;
  failed: number;
  onTimeRate: string;
  avgDeliveryTime: string;
}

interface CustomerRow {
  name: string;
  email: string;
  totalOrders: number;
  deliveredOrders: number;
  satisfactionScore: string;
}

interface DeliveryRow {
  trackingNumber: string;
  status: string;
  courier: string;
  customer: string;
  estimatedDelivery: string;
  actualDelivery: string;
  delay: string;
}

interface EmployeeRow {
  name: string;
  email: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: string;
}

export async function exportPDF(reportId: string, workspaceId: string) {
  const report = await reportRepo.getReportById(reportId, workspaceId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  const record = report as ReportRecord;
  const title = `${capitalizeType(record.type)} Report`;
  const dateRange = `${record.startDate.toLocaleDateString()} - ${record.endDate.toLocaleDateString()}`;

  const pdfBuffer = await generatePDFReport({
    title,
    dateRange,
    data: record.data,
    type: record.type,
  });

  return pdfBuffer;
}

export async function exportExcel(reportId: string, workspaceId: string) {
  const report = await reportRepo.getReportById(reportId, workspaceId);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  const record = report as ReportRecord;
  const rows = transformReportData(record.type, record.data);

  const csvBuffer = await generateCSV(rows as Record<string, unknown>[]);

  return csvBuffer;
}

function transformReportData(type: string, data: unknown): unknown[] {
  switch (type) {
    case "shipment":
      return transformShipmentData(data);
    case "courier":
      return transformCourierData(data);
    case "customer":
      return transformCustomerData(data);
    case "delivery":
      return transformDeliveryData(data);
    case "employee":
      return transformEmployeeData(data);
    default:
      return [];
  }
}

function transformShipmentData(data: unknown): ShipmentRow[] {
  const d = data as { shipments?: Array<Record<string, unknown>> };
  if (!d?.shipments) return [];

  return d.shipments.map((s) => ({
    trackingNumber: String(s.trackingNumber ?? ""),
    status: String(s.status ?? ""),
    courier: String(s.courierName ?? ""),
    customer: String(s.customerName ?? ""),
    origin: String(s.origin ?? ""),
    destination: String(s.destination ?? ""),
    shippedAt: s.shippedAt ? new Date(s.shippedAt as string | number).toLocaleDateString() : "",
    deliveredAt: s.deliveredAt ? new Date(s.deliveredAt as string | number).toLocaleDateString() : "",
  }));
}

function transformCourierData(data: unknown): CourierRow[] {
  const d = data as { courierPerformance?: Array<Record<string, unknown>> };
  if (!d?.courierPerformance) return [];

  return d.courierPerformance.map((c) => ({
    name: String(c.name ?? ""),
    totalShipments: Number(c.totalShipments ?? 0),
    delivered: Number(c.delivered ?? 0),
    failed: Number(c.failed ?? 0),
    onTimeRate: `${Number(c.onTimeRate ?? 0).toFixed(1)}%`,
    avgDeliveryTime: `${Number(c.avgDeliveryTime ?? 0).toFixed(1)} days`,
  }));
}

function transformCustomerData(data: unknown): CustomerRow[] {
  const d = data as { customerDetails?: Array<Record<string, unknown>> };
  if (!d?.customerDetails) return [];

  return d.customerDetails.map((c) => ({
    name: String(c.name ?? ""),
    email: String(c.email ?? ""),
    totalOrders: Number(c.totalOrders ?? 0),
    deliveredOrders: Number(c.deliveredOrders ?? 0),
    satisfactionScore: String(c.satisfactionScore ?? "N/A"),
  }));
}

function transformDeliveryData(data: unknown): DeliveryRow[] {
  const d = data as { deliveryDetails?: Array<Record<string, unknown>> };
  if (!d?.deliveryDetails) return [];

  return d.deliveryDetails.map((dl) => ({
    trackingNumber: String(dl.trackingNumber ?? ""),
    status: String(dl.status ?? ""),
    courier: String(dl.courierName ?? ""),
    customer: String(dl.customerName ?? ""),
    estimatedDelivery: dl.estimatedDelivery
      ? new Date(dl.estimatedDelivery as string | number).toLocaleDateString()
      : "",
    actualDelivery: dl.actualDelivery
      ? new Date(dl.actualDelivery as string | number).toLocaleDateString()
      : "",
    delay: `${Number(dl.delayDays ?? 0)} days`,
  }));
}

function transformEmployeeData(data: unknown): EmployeeRow[] {
  const d = data as { employeePerformance?: Array<Record<string, unknown>> };
  if (!d?.employeePerformance) return [];

  return d.employeePerformance.map((e) => ({
    name: String(e.name ?? ""),
    email: String(e.email ?? ""),
    role: String(e.role ?? ""),
    totalTasks: Number(e.totalTasks ?? 0),
    completedTasks: Number(e.completedTasks ?? 0),
    completionRate: `${Number(e.completionRate ?? 0).toFixed(1)}%`,
  }));
}

function capitalizeType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
