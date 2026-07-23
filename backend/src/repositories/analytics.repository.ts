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

export async function getShipmentTrend(workspaceId: string, start?: Date, end?: Date, groupBy?: string) {
  const where = dateWhere(workspaceId, start, end);
  const shipments = await prisma.shipment.findMany({
    where,
    select: { createdAt: true, status: true }
  });
  const grouped: Record<string, number> = {};
  shipments.forEach(s => {
    let key: string;
    if (groupBy === 'month') {
      key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`;
    } else if (groupBy === 'year') {
      key = `${s.createdAt.getFullYear()}`;
    } else {
      key = s.createdAt.toISOString().split('T')[0];
    }
    grouped[key] = (grouped[key] || 0) + 1;
  });
  return Object.entries(grouped).map(([period, count]) => ({ period, count }));
}

export async function getStatusDistribution(workspaceId: string, start?: Date, end?: Date) {
  const where = dateWhere(workspaceId, start, end);
  const results = await prisma.shipment.groupBy({
    by: ['status'],
    where,
    _count: { id: true }
  });
  return results.map(r => ({ status: r.status, count: r._count.id }));
}

export async function getVolumeByPeriod(workspaceId: string, start?: Date, end?: Date, groupBy?: string) {
  return getShipmentTrend(workspaceId, start, end, groupBy);
}

export async function getCourierPerformanceComparison(workspaceId: string, start?: Date, end?: Date, courierId?: string) {
  const where = dateWhere(workspaceId, start, end);
  if (courierId) (where as any).courierPartnerId = courierId;
  const results = await prisma.shipment.groupBy({
    by: ['courierPartnerId'],
    where,
    _count: { id: true },
    _avg: { shippingCost: true }
  });
  return results.map(r => ({
    courierId: r.courierPartnerId,
    shipmentCount: r._count.id,
    avgShippingCost: r._avg.shippingCost
  }));
}

export async function getCourierDeliveryMetrics(workspaceId: string, start?: Date, end?: Date, courierId?: string) {
  const where = dateWhere(workspaceId, start, end);
  if (courierId) (where as any).courierPartnerId = courierId;
  const results = await prisma.shipment.groupBy({
    by: ['courierPartnerId'],
    where,
    _count: { id: true },
    _sum: { codAmount: true }
  });
  return results.map(r => ({
    courierId: r.courierPartnerId,
    totalShipments: r._count.id,
    totalCodAmount: r._sum.codAmount || 0
  }));
}

export async function getCourierTrendData(workspaceId: string, start?: Date, end?: Date, courierId?: string) {
  const where = dateWhere(workspaceId, start, end);
  if (courierId) (where as any).courierPartnerId = courierId;
  const shipments = await prisma.shipment.findMany({
    where,
    select: { courierPartnerId: true, createdAt: true }
  });
  const grouped: Record<string, Record<string, number>> = {};
  shipments.forEach(s => {
    const dateKey = s.createdAt.toISOString().split('T')[0];
    if (!grouped[dateKey]) grouped[dateKey] = {};
    const ck = s.courierPartnerId ?? 'unknown';
    grouped[dateKey][ck] = (grouped[dateKey][ck] || 0) + 1;
  });
  return Object.entries(grouped).map(([date, couriers]) => ({ date, couriers }));
}

export async function getCustomerSegments(workspaceId: string, start?: Date, end?: Date, customerId?: string) {
  const where = dateWhere(workspaceId, start, end);
  if (customerId) (where as any).customerId = customerId;
  const results = await prisma.shipment.groupBy({
    by: ['customerId'],
    where,
    _count: { id: true },
    _sum: { shippingCost: true }
  });
  return results.map(r => ({
    customerId: r.customerId,
    orderCount: r._count.id,
    totalSpend: r._sum.shippingCost || 0
  }));
}

export async function getCustomerSatisfactionScores(workspaceId: string, start?: Date, end?: Date, customerId?: string) {
  const where = dateWhere(workspaceId, start, end);
  if (customerId) (where as any).customerId = customerId;
  const shipments = await prisma.shipment.findMany({
    where,
    select: { customerId: true, status: true }
  });
  const scores: Record<string, { positive: number; negative: number; neutral: number }> = {};
  shipments.forEach(s => {
    const ck = s.customerId ?? 'unknown';
    if (!scores[ck]) scores[ck] = { positive: 0, negative: 0, neutral: 0 };
    if (s.status === ShipmentStatus.DELIVERED) scores[ck].positive++;
    else if (s.status === ShipmentStatus.FAILED || s.status === ShipmentStatus.RETURNED) scores[ck].negative++;
    else scores[ck].neutral++;
  });
  return Object.entries(scores).map(([customerId, score]) => ({ customerId, ...score }));
}

export async function getCustomerOrderFrequency(workspaceId: string, start?: Date, end?: Date, customerId?: string) {
  const where = dateWhere(workspaceId, start, end);
  if (customerId) (where as any).customerId = customerId;
  const shipments = await prisma.shipment.findMany({
    where,
    select: { customerId: true, createdAt: true }
  });
  const freq: Record<string, number> = {};
  shipments.forEach(s => { const k = s.customerId ?? 'unknown'; freq[k] = (freq[k] || 0) + 1; });
  return Object.entries(freq).map(([customerId, orderCount]) => ({ customerId, orderCount }));
}

export async function getDeliveryStatusBreakdown(workspaceId: string, start?: Date, end?: Date, status?: string) {
  const where = dateWhere(workspaceId, start, end);
  const deliveryWhere: any = { shipment: where };
  if (status) deliveryWhere.completedAt = status === 'completed' ? { not: null } : null;
  const results = await prisma.delivery.groupBy({
    by: ['failureReason'],
    where: { shipment: where },
    _count: { id: true }
  });
  return results.map(r => ({ reason: r.failureReason || 'Completed', count: r._count.id }));
}

export async function getDeliveryTimeAnalysis(workspaceId: string, start?: Date, end?: Date, status?: string) {
  const where = dateWhere(workspaceId, start, end);
  if (status) (where as any).status = status as ShipmentStatus;
  const shipments = await prisma.shipment.findMany({
    where,
    select: { id: true, createdAt: true, actualDelivery: true }
  });
  const times = shipments.filter(s => s.actualDelivery).map(s => ({
    shipmentId: s.id,
    deliveryDays: (s.actualDelivery!.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  }));
  return times;
}

export async function getDeliveryFailureAnalysis(workspaceId: string, start?: Date, end?: Date, status?: string) {
  const where = dateWhere(workspaceId, start, end);
  const deliveries = await prisma.delivery.findMany({
    where: { shipment: where, failureReason: { not: null } },
    select: { failureReason: true, shipment: { select: { courierPartnerId: true } } }
  });
  const reasons: Record<string, number> = {};
  deliveries.forEach(d => {
    const key = d.failureReason || 'Unknown';
    reasons[key] = (reasons[key] || 0) + 1;
  });
  return Object.entries(reasons).map(([reason, count]) => ({ reason, count }));
}

export async function getRevenueTrend(workspaceId: string, start?: Date, end?: Date, groupBy?: string) {
  const where = dateWhere(workspaceId, start, end);
  const shipments = await prisma.shipment.findMany({
    where,
    select: { createdAt: true, shippingCost: true }
  });
  const grouped: Record<string, number> = {};
  shipments.forEach(s => {
    let key: string;
    if (groupBy === 'month') key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, '0')}`;
    else if (groupBy === 'year') key = `${s.createdAt.getFullYear()}`;
    else key = s.createdAt.toISOString().split('T')[0];
    grouped[key] = (grouped[key] || 0) + (Number(s.shippingCost) || 0);
  });
  return Object.entries(grouped).map(([period, revenue]) => ({ period, revenue }));
}

export async function getRevenueByCourier(workspaceId: string, start?: Date, end?: Date) {
  const where = dateWhere(workspaceId, start, end);
  const results = await prisma.shipment.groupBy({
    by: ['courierPartnerId'],
    where,
    _sum: { shippingCost: true },
    _count: { id: true }
  });
  return results.map(r => ({
    courierId: r.courierPartnerId,
    revenue: r._sum.shippingCost || 0,
    shipmentCount: r._count.id
  }));
}

export async function getRevenueByRegion(workspaceId: string, start?: Date, end?: Date) {
  const where = dateWhere(workspaceId, start, end);
  const shipments = await prisma.shipment.findMany({
    where,
    select: { destinationCity: true, shippingCost: true }
  });
  const grouped: Record<string, number> = {};
  shipments.forEach(s => {
    const region = s.destinationCity || 'Unknown';
    grouped[region] = (grouped[region] || 0) + (Number(s.shippingCost) || 0);
  });
  return Object.entries(grouped).map(([region, revenue]) => ({ region, revenue }));
}

export async function getProjectedRevenue(workspaceId: string, start?: Date, end?: Date) {
  const trend = await getRevenueTrend(workspaceId, start, end, 'day');
  if (trend.length === 0) return { projected: 0, confidence: 0 };
  const avg = trend.reduce((sum, t) => sum + t.revenue, 0) / trend.length;
  return { projected: avg * 30, confidence: 0.7, averageDaily: avg };
}

export async function getHourlyHeatmap(workspaceId: string, start?: Date, end?: Date) {
  const where = dateWhere(workspaceId, start, end);
  const shipments = await prisma.shipment.findMany({
    where,
    select: { createdAt: true }
  });
  const heatmap: Record<string, Record<number, number>> = {};
  shipments.forEach(s => {
    const day = s.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
    const hour = s.createdAt.getHours();
    if (!heatmap[day]) heatmap[day] = {};
    heatmap[day][hour] = (heatmap[day][hour] || 0) + 1;
  });
  return Object.entries(heatmap).map(([day, hours]) => ({ day, hours }));
}

export async function getWeeklyHeatmap(workspaceId: string, start?: Date, end?: Date) {
  const where = dateWhere(workspaceId, start, end);
  const shipments = await prisma.shipment.findMany({
    where,
    select: { createdAt: true }
  });
  const weeks: Record<number, Record<string, number>> = {};
  shipments.forEach(s => {
    const week = Math.ceil(s.createdAt.getDate() / 7);
    const day = s.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
    if (!weeks[week]) weeks[week] = {};
    weeks[week][day] = (weeks[week][day] || 0) + 1;
  });
  return Object.entries(weeks).map(([week, days]) => ({ week: parseInt(week), days }));
}

export async function getRegionalHeatmap(workspaceId: string, start?: Date, end?: Date) {
  const where = dateWhere(workspaceId, start, end);
  const shipments = await prisma.shipment.findMany({
    where,
    select: { originCity: true, destinationCity: true }
  });
  const matrix: Record<string, Record<string, number>> = {};
  shipments.forEach(s => {
    const from = s.originCity || 'Unknown';
    const to = s.destinationCity || 'Unknown';
    if (!matrix[from]) matrix[from] = {};
    matrix[from][to] = (matrix[from][to] || 0) + 1;
  });
  return Object.entries(matrix).map(([from, destinations]) => ({ from, destinations }));
}

export async function getComparisonMetrics(workspaceId: string, start?: Date, end?: Date, compareBy?: string, entities?: string[]) {
  const where = dateWhere(workspaceId, start, end);
  if (compareBy === 'courier' && entities?.length) (where as any).courierPartnerId = { in: entities };
  const shipments = await prisma.shipment.findMany({
    where,
    select: { status: true, shippingCost: true, courierPartnerId: true, customerId: true }
  });
  return {
    totalShipments: shipments.length,
    deliveredShipments: shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length,
    failedShipments: shipments.filter(s => s.status === ShipmentStatus.FAILED).length,
    totalRevenue: shipments.reduce((sum, s) => sum + (Number(s.shippingCost) || 0), 0)
  };
}

export async function getHistoricalComparison(workspaceId: string, start?: Date, end?: Date, compareBy?: string, entities?: string[]) {
  const current = await getComparisonMetrics(workspaceId, start, end, compareBy, entities);
  return { current, previous: { totalShipments: 0, deliveredShipments: 0, failedShipments: 0, totalRevenue: 0 } };
}

export async function getAvailableCouriers(workspaceId: string) {
  const couriers = await prisma.courierPartner.findMany({
    where: { workspaceId },
    select: { id: true, name: true }
  });
  return couriers;
}

export async function getAvailableCustomers(workspaceId: string) {
  const customers = await prisma.customer.findMany({
    where: { workspaceId },
    select: { id: true, name: true }
  });
  return customers;
}

export async function getAvailableRegions(workspaceId: string) {
  const customers = await prisma.customer.findMany({
    where: { workspaceId },
    select: { region: true },
    distinct: ['region']
  });
  return customers.map(c => c.region).filter(Boolean);
}

export async function getAvailableStatuses(workspaceId: string) {
  const statuses = await prisma.shipment.findMany({
    where: { workspaceId },
    select: { status: true },
    distinct: ['status']
  });
  return statuses.map(s => s.status);
}

export async function getDataDateRange(workspaceId: string) {
  const first = await prisma.shipment.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
    select: { createdAt: true }
  });
  const last = await prisma.shipment.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });
  return { min: first?.createdAt || null, max: last?.createdAt || null };
}

export async function getTrendData(workspaceId: string, start?: Date, end?: Date, metric?: string, interval?: string) {
  return getShipmentTrend(workspaceId, start, end, interval);
}
