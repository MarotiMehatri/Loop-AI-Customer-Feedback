import type { Server } from "socket.io";
import { clearAnalyticsCache } from "./analytics.cache.js";

let io: Server | null = null;
export function registerAnalyticsSocket(server: Server): void {
  io = server;
}
export function publishAnalyticsRefresh(
  workspaceId: string,
  reason:
    | "FEEDBACK_CREATED"
    | "FEEDBACK_UPDATED"
    | "FEEDBACK_DELETED"
    | "THEME_UPDATED",
): void {
  clearAnalyticsCache(workspaceId);
  io?.to(`workspace:${workspaceId}`).emit("analytics:refresh", {
    workspaceId,
    reason,
    timestamp: new Date().toISOString(),
  });
}
