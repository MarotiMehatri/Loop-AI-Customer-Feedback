import { prisma } from "../lib/prisma.js";
import { Prisma, ShipmentStatus } from "../generated/prisma/client.js";

function shipmentWhere(ws: string, start?: Date, end?: Date): Prisma.ShipmentWhereInput {
  const w: Prisma.ShipmentWhereInput = { workspaceId: ws };
  if (start || end) {
    w.createdAt = {};
    if (start) (w.createdAt as Prisma.DateTimeFilter).gte = start;
    if (end) (w.createdAt as Prisma.DateTimeFilter).lte = end;
  }
  return w;
}

function dateConditions(start?: Date, end?: Date): string {
  const parts: string[] = [];
  if (start) parts.push(`AND s."createdAt" >= '${start.toISOString()}'`);
  if (end) parts.push(`AND s."createdAt" <= '${end.toISOString()}'`);
  return parts.join(' ');
}

export async function getTopPerformingCouriers(ws: string, start?: Date, end?: Date, limit = 10) {
  const dc = dateConditions(start, end);
  return prisma.$queryRaw<{ courierId: string; name: string; rating: number | null; total: number; delivered: number; successRate: number }[]>`
    SELECT cp."id" AS "courierId", cp."name", cp."rating",
      COUNT(*)::int AS "total",
      COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::int AS "delivered",
      CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) ELSE 0 END AS "successRate"
    FROM "Shipment" s
    JOIN "CourierPartner" cp ON cp."id" = s."courierPartnerId"
    WHERE s."workspaceId" = ${ws} AND cp."isActive" = true ${dc}
    GROUP BY cp."id", cp."name", cp."rating"
    ORDER BY "successRate" DESC
    LIMIT ${limit}`;
}

export async function getWorstPerformingCouriers(ws: string, start?: Date, end?: Date, limit = 10) {
  const dc = dateConditions(start, end);
  return prisma.$queryRaw<{ courierId: string; name: string; rating: number | null; total: number; failed: number; successRate: number }[]>`
    SELECT cp."id" AS "courierId", cp."name", cp."rating",
      COUNT(*)::int AS "total",
      COUNT(CASE WHEN s."status" = ${ShipmentStatus.FAILED} THEN 1 END)::int AS "failed",
      CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) ELSE 0 END AS "successRate"
    FROM "Shipment" s
    JOIN "CourierPartner" cp ON cp."id" = s."courierPartnerId"
    WHERE s."workspaceId" = ${ws} AND cp."isActive" = true ${dc}
    GROUP BY cp."id", cp."name", cp."rating"
    ORDER BY "successRate" ASC
    LIMIT ${limit}`;
}

export async function getDelayPatterns(ws: string, start?: Date, end?: Date, threshold = 3) {
  const dc = dateConditions(start, end);
  return prisma.$queryRaw<{ courier: string; route: string; delayCount: number }[]>`
    SELECT cp."name" AS "courier",
      CONCAT(s."originCity", ' → ', s."destinationCity") AS "route",
      COUNT(*)::int AS "delayCount"
    FROM "Shipment" s
    JOIN "CourierPartner" cp ON cp."id" = s."courierPartnerId"
    WHERE s."workspaceId" = ${ws} AND s."actualDelivery" > s."estimatedDelivery" ${dc}
    GROUP BY cp."name", s."originCity", s."destinationCity"
    HAVING COUNT(*) >= ${threshold}
    ORDER BY "delayCount" DESC`;
}

export async function getDelayHotspots(ws: string, start?: Date, end?: Date, threshold = 3) {
  const dc = dateConditions(start, end);
  return prisma.$queryRaw<{ area: string; delayCount: number; avgDelayHours: number }[]>`
    SELECT s."destinationCity" AS "area",
      COUNT(*)::int AS "delayCount",
      ROUND(AVG(EXTRACT(EPOCH FROM (s."actualDelivery" - s."estimatedDelivery")) / 3600)::numeric, 1) AS "avgDelayHours"
    FROM "Shipment" s
    WHERE s."workspaceId" = ${ws} AND s."actualDelivery" > s."estimatedDelivery" AND s."destinationCity" IS NOT NULL ${dc}
    GROUP BY s."destinationCity"
    HAVING COUNT(*) >= ${threshold}
    ORDER BY "delayCount" DESC`;
}

export async function getDelayTrends(ws: string, start?: Date, end?: Date) {
  const dc = dateConditions(start, end);
  return prisma.$queryRaw<{ date: Date; delayCount: number }[]>`
    SELECT DATE(s."createdAt") AS "date",
      COUNT(*)::int AS "delayCount"
    FROM "Shipment" s
    WHERE s."workspaceId" = ${ws} AND s."actualDelivery" > s."estimatedDelivery" ${dc}
    GROUP BY DATE(s."createdAt")
    ORDER BY "date" ASC`;
}

export async function getRegionStats(ws: string, start?: Date, end?: Date, region?: string) {
  let dc = dateConditions(start, end);
  if (region) dc += ` AND s."originCity" = '${region}'`;
  return prisma.$queryRaw<{ region: string; total: number; delivered: number; failed: number }[]>`
    SELECT s."originCity" AS "region",
      COUNT(*)::int AS "total",
      COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::int AS "delivered",
      COUNT(CASE WHEN s."status" = ${ShipmentStatus.FAILED} THEN 1 END)::int AS "failed"
    FROM "Shipment" s
    WHERE s."workspaceId" = ${ws} AND s."originCity" IS NOT NULL ${dc}
    GROUP BY s."originCity"
    ORDER BY "total" DESC`;
}

export async function getRegionalPerformance(ws: string, start?: Date, end?: Date, region?: string) {
  let dc = dateConditions(start, end);
  if (region) dc += ` AND s."originCity" = '${region}'`;
  return prisma.$queryRaw<{ region: string; successRate: number; avgShippingCost: number; totalShipments: number }[]>`
    SELECT s."originCity" AS "region",
      COUNT(*)::int AS "totalShipments",
      CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) ELSE 0 END AS "successRate",
      ROUND(COALESCE(AVG(s."shippingCost"), 0)::numeric, 2) AS "avgShippingCost"
    FROM "Shipment" s
    WHERE s."workspaceId" = ${ws} AND s."originCity" IS NOT NULL ${dc}
    GROUP BY s."originCity"
    ORDER BY "successRate" DESC`;
}

export async function getTopRegions(ws: string, start?: Date, end?: Date, limit = 10) {
  const dc = dateConditions(start, end);
  return prisma.$queryRaw<{ region: string; totalShipments: number; successRate: number }[]>`
    SELECT s."originCity" AS "region",
      COUNT(*)::int AS "totalShipments",
      CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) ELSE 0 END AS "successRate"
    FROM "Shipment" s
    WHERE s."workspaceId" = ${ws} AND s."originCity" IS NOT NULL ${dc}
    GROUP BY s."originCity"
    ORDER BY "totalShipments" DESC
    LIMIT ${limit}`;
}

export async function getCustomerMetrics(ws: string, start?: Date, end?: Date, customerId?: string) {
  const where = shipmentWhere(ws, start, end);
  if (customerId) where.customerId = customerId;
  const customers = await prisma.customer.findMany({
    where: { workspaceId: ws, ...(customerId ? { id: customerId } : {}) },
    include: { shipments: { where, select: { shippingCost: true, status: true } } },
  });
  return customers.map((c) => ({
    customerId: c.id,
    name: c.name,
    totalShipments: c.shipments.length,
    totalSpent: c.shipments.reduce((sum, s) => sum + (s.shippingCost ?? 0), 0),
    avgOrderValue: c.shipments.length ? Math.round(c.shipments.reduce((sum, s) => sum + (s.shippingCost ?? 0), 0) / c.shipments.length * 100) / 100 : 0,
    deliveredCount: c.shipments.filter((s) => s.status === ShipmentStatus.DELIVERED).length,
  }));
}

export async function getCustomerSegments(ws: string, start?: Date, end?: Date, customerId?: string) {
  const metrics = await getCustomerMetrics(ws, start, end, customerId);
  const segments = { high: 0, medium: 0, low: 0, inactive: 0 };
  for (const m of metrics) {
    if (m.totalShipments >= 20) segments.high++;
    else if (m.totalShipments >= 5) segments.medium++;
    else if (m.totalShipments >= 1) segments.low++;
    else segments.inactive++;
  }
  return Object.entries(segments).map(([segment, count]) => ({ segment, count }));
}

export async function getCustomerSatisfactionTrend(ws: string, start?: Date, end?: Date, customerId?: string) {
  let dc = dateConditions(start, end);
  if (customerId) dc += ` AND s."customerId" = '${customerId}'`;
  return prisma.$queryRaw<{ date: Date; satisfactionScore: number }[]>`
    SELECT DATE(s."createdAt") AS "date",
      CASE WHEN COUNT(*) > 0 THEN ROUND(COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) ELSE 0 END AS "satisfactionScore"
    FROM "Shipment" s
    WHERE s."workspaceId" = ${ws} ${dc}
    GROUP BY DATE(s."createdAt")
    ORDER BY "date" ASC`;
}

export async function getCourierRecommendations(ws: string, category?: string) {
  const couriers = await prisma.courierPartner.findMany({
    where: { workspaceId: ws, isActive: true },
    include: { shipments: { select: { status: true } } },
  });
  const recs = couriers.map((c) => {
    const total = c.shipments.length;
    const delivered = c.shipments.filter((s) => s.status === ShipmentStatus.DELIVERED).length;
    const successRate = total ? Math.round(delivered / total * 10000) / 100 : 0;
    let priority = "low";
    let reason = "Performing well";
    if (successRate < 70) { priority = "high"; reason = `Low success rate (${successRate}%) - consider replacement`; }
    else if (successRate < 85) { priority = "medium"; reason = `Moderate success rate (${successRate}%) - monitor closely`; }
    return { courierId: c.id, name: c.name, successRate, reason, priority };
  });
  if (category === "high") return recs.filter((r) => r.priority === "high");
  if (category === "medium") return recs.filter((r) => r.priority === "medium");
  if (category === "low") return recs.filter((r) => r.priority === "low");
  return recs;
}

export async function getRouteRecommendations(ws: string, category?: string) {
  const routes = await prisma.$queryRaw<{ route: string; delayCount: number; total: number }[]>`
    SELECT CONCAT(s."originCity", ' → ', s."destinationCity") AS "route",
      COUNT(CASE WHEN s."actualDelivery" > s."estimatedDelivery" THEN 1 END)::int AS "delayCount",
      COUNT(*)::int AS "total"
    FROM "Shipment" s
    WHERE s."workspaceId" = ${ws} AND s."originCity" IS NOT NULL AND s."destinationCity" IS NOT NULL
    GROUP BY s."originCity", s."destinationCity"
    HAVING COUNT(*) >= 5`;
  const recs = routes.map((r) => {
    const delayRate = r.total ? Math.round(r.delayCount / r.total * 10000) / 100 : 0;
    let priority = "low";
    let reason = "Route performing well";
    if (delayRate > 30) { priority = "high"; reason = `High delay rate (${delayRate}%) on ${r.route}`; }
    else if (delayRate > 15) { priority = "medium"; reason = `Moderate delay rate (${delayRate}%) on ${r.route}`; }
    return { route: r.route, delayRate, delayCount: r.delayCount, reason, priority };
  });
  if (category === "high") return recs.filter((r) => r.priority === "high");
  if (category === "medium") return recs.filter((r) => r.priority === "medium");
  if (category === "low") return recs.filter((r) => r.priority === "low");
  return recs;
}

export async function getProcessRecommendations(ws: string, category?: string) {
  const stats = await prisma.$queryRaw<{ total: number; delivered: number; failed: number; delayed: number; avgCost: number }[]>`
    SELECT COUNT(*)::int AS "total",
      COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELIVERED} THEN 1 END)::int AS "delivered",
      COUNT(CASE WHEN s."status" = ${ShipmentStatus.FAILED} THEN 1 END)::int AS "failed",
      COUNT(CASE WHEN s."status" = ${ShipmentStatus.DELAYED} THEN 1 END)::int AS "delayed",
      ROUND(COALESCE(AVG(s."shippingCost"), 0)::numeric, 2) AS "avgCost"
    FROM "Shipment" s WHERE s."workspaceId" = ${ws}`;
  const s = stats[0];
  if (!s) return [];
  const recs: { process: string; reason: string; priority: string }[] = [];
  const failRate = s.total ? Math.round(s.failed / s.total * 10000) / 100 : 0;
  const delayRate = s.total ? Math.round(s.delayed / s.total * 10000) / 100 : 0;
  if (failRate > 10) recs.push({ process: "Delivery Quality", reason: `High failure rate (${failRate}%) - review delivery process`, priority: "high" });
  if (delayRate > 20) recs.push({ process: "Timeliness", reason: `High delay rate (${delayRate}%) - optimize logistics`, priority: "high" });
  if (s.avgCost > 100) recs.push({ process: "Cost Optimization", reason: `Average shipping cost ($${s.avgCost}) is high - negotiate better rates`, priority: "medium" });
  if (recs.length === 0) recs.push({ process: "General", reason: "All metrics within acceptable ranges", priority: "low" });
  if (category === "high") return recs.filter((r) => r.priority === "high");
  if (category === "medium") return recs.filter((r) => r.priority === "medium");
  if (category === "low") return recs.filter((r) => r.priority === "low");
  return recs;
}
