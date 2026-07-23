import { prisma } from "../lib/prisma.js";
import { Prisma, ShipmentStatus } from "../generated/prisma/client.js";

function dateWhere(ws: string, start?: Date, end?: Date): Prisma.ShipmentWhereInput {
  const w: Prisma.ShipmentWhereInput = { workspaceId: ws };
  if (start || end) {
    w.createdAt = {};
    if (start) (w.createdAt as Prisma.DateTimeFilter).gte = start;
    if (end) (w.createdAt as Prisma.DateTimeFilter).lte = end;
  }
  return w;
}

export async function getShipmentReportData(ws: string, start?: Date, end?: Date, filters?: any) {
  const where = dateWhere(ws, start, end);
  const shipments = await prisma.shipment.findMany({ where });
  return { shipments, total: shipments.length, filters };
}

export async function getCourierReportData(ws: string, start?: Date, end?: Date, filters?: any) {
  const where = dateWhere(ws, start, end);
  const results = await prisma.shipment.groupBy({
    by: ['courierPartnerId'],
    where,
    _count: { id: true },
    _sum: { shippingCost: true }
  });
  return { couriers: results, filters };
}

export async function getCustomerReportData(ws: string, start?: Date, end?: Date, filters?: any) {
  const where = dateWhere(ws, start, end);
  const results = await prisma.shipment.groupBy({
    by: ['customerId'],
    where,
    _count: { id: true },
    _sum: { shippingCost: true }
  });
  return { customers: results, filters };
}

export async function getDeliveryReportData(ws: string, start?: Date, end?: Date, filters?: any) {
  const where = dateWhere(ws, start, end);
  const deliveries = await prisma.delivery.findMany({
    where: { shipment: where },
    include: { shipment: true }
  });
  return { deliveries, total: deliveries.length, filters };
}

export async function getEmployeeReportData(ws: string, start?: Date, end?: Date, filters?: any) {
  const users = await prisma.user.findMany({
    where: { workspaceId: ws },
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true }
  });
  return { employees: users, filters };
}

export async function saveReport(data: { workspaceId: string; type: string; startDate: Date; endDate: Date; filters: any; data: any }) {
  return prisma.report.create({
    data: {
      title: `${data.type} Report`,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      data: data.data,
      workspaceId: data.workspaceId,
      userId: 'system'
    }
  });
}

export async function getShipmentReportSummary(ws: string, start?: Date, end?: Date, status?: string, courierId?: string) {
  const where = dateWhere(ws, start, end);
  if (status) (where as any).status = status as ShipmentStatus;
  if (courierId) (where as any).courierPartnerId = courierId;
  const total = await prisma.shipment.count({ where });
  const delivered = await prisma.shipment.count({ where: { ...where, status: ShipmentStatus.DELIVERED } });
  const failed = await prisma.shipment.count({ where: { ...where, status: ShipmentStatus.FAILED } });
  const revenue = await prisma.shipment.aggregate({ where, _sum: { shippingCost: true } });
  return { total, delivered, failed, revenue: Number(revenue._sum.shippingCost) || 0 };
}

export async function getShipmentReportDetails(ws: string, start?: Date, end?: Date, status?: string, courierId?: string) {
  const where = dateWhere(ws, start, end);
  if (status) (where as any).status = status as ShipmentStatus;
  if (courierId) (where as any).courierPartnerId = courierId;
  return prisma.shipment.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getShipmentStatusTrend(ws: string, start?: Date, end?: Date, status?: string, courierId?: string) {
  const where = dateWhere(ws, start, end);
  if (status) (where as any).status = status as ShipmentStatus;
  if (courierId) (where as any).courierPartnerId = courierId;
  const shipments = await prisma.shipment.findMany({ where, select: { createdAt: true, status: true } });
  const trend: Record<string, Record<string, number>> = {};
  shipments.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0];
    if (!trend[day]) trend[day] = {};
    trend[day][s.status] = (trend[day][s.status] || 0) + 1;
  });
  return Object.entries(trend).map(([date, statuses]) => ({ date, statuses }));
}

export async function getCourierReportSummary(ws: string, start?: Date, end?: Date, courierId?: string) {
  const where = dateWhere(ws, start, end);
  if (courierId) (where as any).courierPartnerId = courierId;
  const shipments = await prisma.shipment.findMany({ where, select: { shippingCost: true, status: true } });
  return {
    totalShipments: shipments.length,
    totalRevenue: shipments.reduce((sum, s) => sum + (Number(s.shippingCost) || 0), 0),
    deliveredShipments: shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length
  };
}

export async function getCourierPerformanceDetails(ws: string, start?: Date, end?: Date, courierId?: string) {
  const where = dateWhere(ws, start, end);
  if (courierId) (where as any).courierPartnerId = courierId;
  return prisma.shipment.findMany({
    where,
    select: { courierPartnerId: true, status: true, shippingCost: true, createdAt: true }
  });
}

export async function getCourierDeliveryMetrics(ws: string, start?: Date, end?: Date, courierId?: string) {
  return getCourierReportSummary(ws, start, end, courierId);
}

export async function getCustomerReportSummary(ws: string, start?: Date, end?: Date, customerId?: string) {
  const where = dateWhere(ws, start, end);
  if (customerId) (where as any).customerId = customerId;
  const shipments = await prisma.shipment.findMany({ where, select: { shippingCost: true, status: true } });
  return {
    totalOrders: shipments.length,
    totalSpend: shipments.reduce((sum, s) => sum + (Number(s.shippingCost) || 0), 0),
    deliveredOrders: shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length
  };
}

export async function getCustomerReportDetails(ws: string, start?: Date, end?: Date, customerId?: string) {
  const where = dateWhere(ws, start, end);
  if (customerId) (where as any).customerId = customerId;
  return prisma.shipment.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getCustomerOrderHistory(ws: string, start?: Date, end?: Date, customerId?: string) {
  return getCustomerReportDetails(ws, start, end, customerId);
}

export async function getDeliveryReportSummary(ws: string, start?: Date, end?: Date, status?: string) {
  const where = dateWhere(ws, start, end);
  if (status) (where as any).status = status as ShipmentStatus;
  const total = await prisma.shipment.count({ where });
  const delivered = await prisma.shipment.count({ where: { ...where, status: ShipmentStatus.DELIVERED } });
  return { total, delivered, failed: total - delivered };
}

export async function getDeliveryReportDetails(ws: string, start?: Date, end?: Date, status?: string) {
  const where = dateWhere(ws, start, end);
  if (status) (where as any).status = status as ShipmentStatus;
  return prisma.shipment.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export async function getDeliveryFailureAnalysis(ws: string, start?: Date, end?: Date, status?: string) {
  const where = dateWhere(ws, start, end);
  const deliveries = await prisma.delivery.findMany({
    where: { shipment: where, failureReason: { not: null } },
    select: { failureReason: true }
  });
  const reasons: Record<string, number> = {};
  deliveries.forEach(d => {
    const reason = d.failureReason || 'Unknown';
    reasons[reason] = (reasons[reason] || 0) + 1;
  });
  return { reasons: Object.entries(reasons).map(([reason, count]) => ({ reason, count })) };
}

export async function getEmployeeReportSummary(ws: string, start?: Date, end?: Date, employeeId?: string) {
  const users = await prisma.user.findMany({
    where: { workspaceId: ws, ...(employeeId ? { id: employeeId } : {}) },
    select: { id: true, name: true, lastLoginAt: true }
  });
  return { employees: users, total: users.length };
}

export async function getEmployeePerformanceDetails(ws: string, start?: Date, end?: Date, employeeId?: string) {
  return getEmployeeReportSummary(ws, start, end, employeeId);
}

export async function getEmployeeTaskBreakdown(ws: string, start?: Date, end?: Date, employeeId?: string) {
  return { tasks: [], breakdown: {} };
}

export async function getReportHistory(ws: string, skip?: number, limit?: number) {
  const where = { workspaceId: ws };
  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: skip || 0,
    take: limit || 10
  });
  const total = await prisma.report.count({ where });
  const page = Math.floor((skip || 0) / (limit || 10)) + 1;
  return { reports, total, page, limit: limit || 10, totalPages: Math.ceil(total / (limit || 10)) };
}

export async function countReports(ws: string) {
  return prisma.report.count({ where: { workspaceId: ws } });
}

export async function getReportById(reportId: string, ws: string) {
  return prisma.report.findFirst({ where: { id: reportId, workspaceId: ws } });
}

export async function deleteReport(reportId: string, ws: string) {
  await prisma.report.deleteMany({ where: { id: reportId, workspaceId: ws } });
}
