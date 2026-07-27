import { EventEmitter } from "node:events";

export interface FeedbackEvent {
  type: "CREATED" | "UPDATED" | "DELETED" | "STATUS_CHANGED" | "IMPORTED";
  feedbackId: string;
  workspaceId: string;
  userId: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

type FeedbackEventHandler = (event: FeedbackEvent) => void | Promise<void>;

const feedbackEventBus = new EventEmitter();
feedbackEventBus.setMaxListeners(50);

export function emitFeedbackEvent(event: FeedbackEvent): void {
  feedbackEventBus.emit("feedback", event);
}

export function onFeedbackEvent(handler: FeedbackEventHandler): () => void {
  feedbackEventBus.on("feedback", handler);
  return () => {
    feedbackEventBus.off("feedback", handler);
  };
}

export function onFeedbackCreated(handler: FeedbackEventHandler): () => void {
  feedbackEventBus.on("feedback", (event: FeedbackEvent) => {
    if (event.type === "CREATED") handler(event);
  });
  return () => {
    feedbackEventBus.removeAllListeners("feedback");
  };
}

export function onFeedbackUpdated(handler: FeedbackEventHandler): () => void {
  feedbackEventBus.on("feedback", (event: FeedbackEvent) => {
    if (event.type === "UPDATED") handler(event);
  });
  return () => {
    feedbackEventBus.removeAllListeners("feedback");
  };
}

export function onFeedbackDeleted(handler: FeedbackEventHandler): () => void {
  feedbackEventBus.on("feedback", (event: FeedbackEvent) => {
    if (event.type === "DELETED") handler(event);
  });
  return () => {
    feedbackEventBus.removeAllListeners("feedback");
  };
}

export function onFeedbackStatusChanged(handler: FeedbackEventHandler): () => void {
  feedbackEventBus.on("feedback", (event: FeedbackEvent) => {
    if (event.type === "STATUS_CHANGED") handler(event);
  });
  return () => {
    feedbackEventBus.removeAllListeners("feedback");
  };
}

export function createFeedbackEvent(
  type: FeedbackEvent["type"],
  feedbackId: string,
  workspaceId: string,
  userId: string,
  data?: Record<string, unknown>,
): FeedbackEvent {
  return {
    type,
    feedbackId,
    workspaceId,
    userId,
    data,
    timestamp: new Date(),
  };
}
