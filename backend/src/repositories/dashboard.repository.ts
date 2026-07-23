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

export async function countShipments(ws: string, start?: Date, end?: Date) {
  return prisma.shipment.count({ where: dateWhere(ws, start, end) });
}

export async function countShipmentsByStatus(ws: string, start?: Date, end?: Date, status?: string) {
  const where = dateWhere(ws, start, end);
  if (status) (where as any).status = status as ShipmentStatus;
  return prisma.shipment.count({ where });
}

export async function sumRevenue(ws: string, start?: Date, end?: Date) {
  const result = await prisma.shipment.aggregate({
    where: dateWhere(ws, start, end),
    _sum: { shippingCost: true }
  });
  return Number(result._sum.shippingCost) || 0;
}

export async function countUniqueCustomers(ws: string, start?: Date, end?: Date) {
  const result = await prisma.shipment.groupBy({
    by: ['customerId'],
    where: dateWhere(ws, start, end)
  });
  return result.length;
}

export async function getTopCouriers(ws: string, start?: Date, end?: Date, limit?: number) {
  const results = await prisma.shipment.groupBy({
    by: ['courierPartnerId'],
    where: dateWhere(ws, start, end),
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit || 5
  });
  const courierIds = results.map(r => r.courierPartnerId).filter((id): id is string => id !== null);
  const couriers = await prisma.courierPartner.findMany({
    where: { id: { in: courierIds } },
    select: { id: true, name: true }
  });
  return results.map(r => ({
    ...r,
    courier: couriers.find(c => c.id === r.courierPartnerId)
  }));
}

export async function getRecentActivity(ws: string, limit?: number) {
  return prisma.shipment.findMany({
    where: { workspaceId: ws },
    orderBy: { createdAt: 'desc' },
    take: limit || 10,
    select: { id: true, trackingNumber: true, status: true, createdAt: true, destinationCity: true }
  });
}

export async function getShipmentStatusCounts(ws: string, start?: Date, end?: Date) {
  const results = await prisma.shipment.groupBy({
    by: ['status'],
    where: dateWhere(ws, start, end),
    _count: { id: true }
  });
  return results.map(r => ({ status: r.status, count: r._count.id }));
}

export async function getChannelBreakdown(ws: string, start?: Date, end?: Date) {
  const shipments = await prisma.shipment.findMany({
    where: dateWhere(ws, start, end),
    select: { originCity: true }
  });
  const channels: Record<string, number> = {};
  shipments.forEach(s => {
    const channel = s.originCity || 'Unknown';
    channels[channel] = (channels[channel] || 0) + 1;
  });
  return Object.entries(channels).map(([channel, count]) => ({ channel, count }));
}

export async function getDailyShipmentTrend(ws: string, start?: Date, end?: Date) {
  const shipments = await prisma.shipment.findMany({
    where: dateWhere(ws, start, end),
    select: { createdAt: true }
  });
  const trend: Record<string, number> = {};
  shipments.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0];
    trend[day] = (trend[day] || 0) + 1;
  });
  return Object.entries(trend).map(([date, count]) => ({ date, count }));
}

export async function getOnTimeDeliveryRate(ws: string, start?: Date, end?: Date) {
  const shipments = await prisma.shipment.findMany({
    where: { ...dateWhere(ws, start, end), status: ShipmentStatus.DELIVERED },
    select: { estimatedDelivery: true, actualDelivery: true }
  });
  if (shipments.length === 0) return 0;
  const onTime = shipments.filter(s => s.actualDelivery && s.estimatedDelivery && s.actualDelivery <= s.estimatedDelivery).length;
  return onTime / shipments.length;
}

export async function getAverageDeliveryTime(ws: string, start?: Date, end?: Date) {
  const shipments = await prisma.shipment.findMany({
    where: { ...dateWhere(ws, start, end), actualDelivery: { not: null } },
    select: { createdAt: true, actualDelivery: true }
  });
  if (shipments.length === 0) return 0;
  const totalDays = shipments.reduce((sum, s) => {
    const diff = (s.actualDelivery!.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return sum + diff;
  }, 0);
  return totalDays / shipments.length;
}

export async function getDeliveryPerformanceByCourier(ws: string, start?: Date, end?: Date) {
  const results = await prisma.shipment.groupBy({
    by: ['courierPartnerId'],
    where: dateWhere(ws, start, end),
    _count: { id: true },
    _avg: { shippingCost: true }
  });
  return results.map(r => ({
    courierId: r.courierPartnerId,
    totalShipments: r._count.id,
    avgShippingCost: r._avg.shippingCost
  }));
}

export async function getDeliveryPerformanceTrend(ws: string, start?: Date, end?: Date) {
  const shipments = await prisma.shipment.findMany({
    where: dateWhere(ws, start, end),
    select: { createdAt: true, status: true, shippingCost: true }
  });
  const trend: Record<string, { count: number; revenue: number; delivered: number }> = {};
  shipments.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0];
    if (!trend[day]) trend[day] = { count: 0, revenue: 0, delivered: 0 };
    trend[day].count++;
    trend[day].revenue += Number(s.shippingCost) || 0;
    if (s.status === ShipmentStatus.DELIVERED) trend[day].delivered++;
  });
  return Object.entries(trend).map(([date, data]) => ({ date, ...data }));
}

export async function getCourierStats(ws: string, start?: Date, end?: Date) {
  return getDeliveryPerformanceByCourier(ws, start, end);
}

export async function getCourierRankings(ws: string, start?: Date, end?: Date) {
  return getDeliveryPerformanceByCourier(ws, start, end);
}

export async function getCourierPerformanceTrend(ws: string, start?: Date, end?: Date) {
  return getDeliveryPerformanceTrend(ws, start, end);
}

export async function getFailedDeliveries(ws: string, start?: Date, end?: Date, skip?: number, limit?: number) {
  return prisma.shipment.findMany({
    where: { ...dateWhere(ws, start, end), status: ShipmentStatus.FAILED },
    skip: skip || 0,
    take: limit || 10,
    select: { id: true, trackingNumber: true, status: true, createdAt: true, destinationCity: true }
  });
}

export async function countFailedDeliveries(ws: string, start?: Date, end?: Date) {
  return prisma.shipment.count({
    where: { ...dateWhere(ws, start, end), status: ShipmentStatus.FAILED }
  });
}

export async function getDelayedShipments(ws: string, start?: Date, end?: Date, skip?: number, limit?: number) {
  return prisma.shipment.findMany({
    where: { ...dateWhere(ws, start, end), status: ShipmentStatus.DELAYED },
    skip: skip || 0,
    take: limit || 10,
    select: { id: true, trackingNumber: true, status: true, createdAt: true, destinationCity: true }
  });
}

export async function countDelayedShipments(ws: string, start?: Date, end?: Date) {
  return prisma.shipment.count({
    where: { ...dateWhere(ws, start, end), status: ShipmentStatus.DELAYED }
  });
}

export async function getMonthlyShipmentSummary(ws: string, start?: Date, end?: Date) {
  const where = dateWhere(ws, start, end);
  const total = await prisma.shipment.count({ where });
  const delivered = await prisma.shipment.count({ where: { ...where, status: ShipmentStatus.DELIVERED } });
  const failed = await prisma.shipment.count({ where: { ...where, status: ShipmentStatus.FAILED } });
  const revenue = await sumRevenue(ws, start, end);
  return { total, delivered, failed, revenue };
}

export async function getMonthlyDailyBreakdown(ws: string, start?: Date, end?: Date) {
  return getDailyShipmentTrend(ws, start, end);
}

export async function getMonthlyTopIssues(ws: string, start?: Date, end?: Date) {
  const deliveries = await prisma.delivery.findMany({
    where: { shipment: dateWhere(ws, start, end), failureReason: { not: null } },
    select: { failureReason: true }
  });
  const issues: Record<string, number> = {};
  deliveries.forEach(d => {
    const reason = d.failureReason || 'Unknown';
    issues[reason] = (issues[reason] || 0) + 1;
  });
  return Object.entries(issues).map(([issue, count]) => ({ issue, count })).sort((a, b) => b.count - a.count);
}

export async function getMonthlyCourierPerformance(ws: string, start?: Date, end?: Date) {
  return getDeliveryPerformanceByCourier(ws, start, end);
}

export async function getCustomerSatisfactionScore(ws: string, start?: Date, end?: Date) {
  const shipments = await prisma.shipment.findMany({
    where: dateWhere(ws, start, end),
    select: { status: true }
  });
  if (shipments.length === 0) return 0;
  const positive = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
  return positive / shipments.length;
}

export async function getRevenueGrowth(ws: string, start?: Date, end?: Date) {
  return sumRevenue(ws, start, end);
}
