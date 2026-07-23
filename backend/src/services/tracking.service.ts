import * as trackingRepo from "../repositories/tracking.repository.js";
import { ApiError } from "../utils/apiError.js";

export async function search(workspaceId: string, query: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    trackingRepo.searchShipments(workspaceId, query, skip, limit),
    trackingRepo.countSearchResults(workspaceId, query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    query,
  };
}

export async function timeline(workspaceId: string, shipmentId: string) {
  const shipment = await trackingRepo.getShipmentById(shipmentId, workspaceId);

  if (!shipment) {
    throw new ApiError(404, "Shipment not found");
  }

  const events = await trackingRepo.getShipmentTimeline(shipmentId);

  return {
    shipment: {
      id: shipment.id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      courier: shipment.courier,
      customer: shipment.customer,
      origin: shipment.origin,
      destination: shipment.destination,
    },
    timeline: events,
  };
}

export async function status(workspaceId: string, shipmentId: string) {
  const shipment = await trackingRepo.getShipmentStatus(shipmentId, workspaceId);

  if (!shipment) {
    throw new ApiError(404, "Shipment not found");
  }

  return shipment;
}

export async function parcelHistory(
  workspaceId: string,
  customerId: string,
  page = 1,
  limit = 20,
) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    trackingRepo.getParcelHistoryByCustomer(workspaceId, customerId, skip, limit),
    trackingRepo.countParcelHistoryByCustomer(workspaceId, customerId),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    customerId,
  };
}
