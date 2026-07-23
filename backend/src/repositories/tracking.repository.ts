import { prisma } from "../lib/prisma.js";
import { Prisma, ShipmentStatus, NotificationType } from "../generated/prisma/client.js";

export async function searchShipments(ws: string, query: string, skip: number, limit: number) {
  const where: Prisma.ShipmentWhereInput = {
    workspaceId: ws,
    OR: [
      { trackingNumber: { contains: query } },
      { customer: { name: { contains: query } } },
      { customer: { email: { contains: query } } },
      { customer: { phone: { contains: query } } },
    ],
  };
  return prisma.shipment.findMany({
    where,
    include: { courierPartner: true, customer: true },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
}

export async function countSearchResults(ws: string, query: string) {
  const where: Prisma.ShipmentWhereInput = {
    workspaceId: ws,
    OR: [
      { trackingNumber: { contains: query } },
      { customer: { name: { contains: query } } },
      { customer: { email: { contains: query } } },
      { customer: { phone: { contains: query } } },
    ],
  };
  return prisma.shipment.count({ where });
}

export async function getShipmentById(shipmentId: string, ws: string) {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, workspaceId: ws },
    include: { courierPartner: true, customer: true },
  });
  if (!shipment) return null;
  return {
    id: shipment.id,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    courier: shipment.courierPartner,
    customer: shipment.customer,
    origin: shipment.originCity,
    destination: shipment.destinationCity,
  };
}

export async function getShipmentTimeline(shipmentId: string) {
  return prisma.trackingEvent.findMany({
    where: { shipmentId },
    orderBy: { timestamp: "asc" },
  });
}

export async function getShipmentStatus(shipmentId: string, ws: string) {
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, workspaceId: ws },
    include: {
      trackingEvents: { orderBy: { timestamp: "desc" }, take: 1 },
      courierPartner: true,
      customer: true,
    },
  });
  if (!shipment) return null;
  return {
    id: shipment.id,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    courier: shipment.courierPartner,
    customer: shipment.customer,
    origin: shipment.originCity,
    destination: shipment.destinationCity,
    lastEvent: shipment.trackingEvents[0] ?? null,
  };
}

export async function getParcelHistoryByCustomer(ws: string, customerId: string, skip: number, limit: number) {
  return prisma.shipment.findMany({
    where: { workspaceId: ws, customerId },
    include: { courierPartner: true, trackingEvents: { orderBy: { timestamp: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
}

export async function countParcelHistoryByCustomer(ws: string, customerId: string) {
  return prisma.shipment.count({
    where: { workspaceId: ws, customerId },
  });
}
