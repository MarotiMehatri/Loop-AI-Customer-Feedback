import type { Response } from "express";
import type { Server } from "socket.io";
import { clearAnalyticsCache } from "./analytics.cache.js";
import { analyticsService } from "./analytics.service.js";
import type { AnalyticsQueryInput } from "./analytics.types.js";

interface StreamClient {
  res: Response;
  workspaceId: string;
  intervalId: ReturnType<typeof setInterval>;
  lastData: string;
}

const streamClients = new Map<string, StreamClient>();
const STREAM_INTERVAL_MS = 30_000;

export function registerAnalyticsStream(
  res: Response,
  workspaceId: string,
  query: AnalyticsQueryInput,
): void {
  const clientId = `${workspaceId}:${Date.now()}`;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  res.write(`data: ${JSON.stringify({ type: "connected", clientId, timestamp: new Date().toISOString() })}\n\n`);

  const intervalId = setInterval(async () => {
    try {
      const dashboard = await analyticsService.getDashboard(query);
      const data = JSON.stringify({ type: "update", data: dashboard, timestamp: new Date().toISOString() });

      if (data !== streamClients.get(clientId)?.lastData) {
        res.write(`data: ${data}\n\n`);
        const client = streamClients.get(clientId);
        if (client) client.lastData = data;
      }
    } catch {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to fetch analytics", timestamp: new Date().toISOString() })}\n\n`);
    }
  }, STREAM_INTERVAL_MS);

  streamClients.set(clientId, {
    res,
    workspaceId,
    intervalId,
    lastData: "",
  });

  res.on("close", () => {
    const client = streamClients.get(clientId);
    if (client) {
      clearInterval(client.intervalId);
      streamClients.delete(clientId);
    }
  });
}

export function notifyAnalyticsStream(
  workspaceId: string,
  reason: "FEEDBACK_CREATED" | "FEEDBACK_UPDATED" | "FEEDBACK_DELETED" | "THEME_UPDATED",
): void {
  clearAnalyticsCache(workspaceId);

  for (const [clientId, client] of streamClients) {
    if (client.workspaceId === workspaceId) {
      try {
        client.res.write(
          `data: ${JSON.stringify({ type: "invalidate", reason, timestamp: new Date().toISOString() })}\n\n`,
        );
      } catch {
        clearInterval(client.intervalId);
        streamClients.delete(clientId);
      }
    }
  }
}

export function registerAnalyticsSocket(server: Server): void {
  server.on("connection", (socket) => {
    socket.on("analytics:subscribe", (data: { workspaceId: string }) => {
      if (data.workspaceId) {
        socket.join(`analytics:${data.workspaceId}`);
      }
    });

    socket.on("analytics:unsubscribe", (data: { workspaceId: string }) => {
      if (data.workspaceId) {
        socket.leave(`analytics:${data.workspaceId}`);
      }
    });
  });
}

export function publishAnalyticsRefresh(
  workspaceId: string,
  reason: "FEEDBACK_CREATED" | "FEEDBACK_UPDATED" | "FEEDBACK_DELETED" | "THEME_UPDATED",
): void {
  clearAnalyticsCache(workspaceId);
  notifyAnalyticsStream(workspaceId, reason);
}
