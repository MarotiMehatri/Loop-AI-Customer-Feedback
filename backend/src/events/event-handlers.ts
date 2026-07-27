import { eventBus } from "./event-bus.js";
import {
  FEEDBACK_CREATED,
  FEEDBACK_UPDATED,
  FEEDBACK_DELETED,
} from "./event-names.js";
import { clearAnalyticsCache } from "../modules/analytics/analytics.cache.js";
import type { FeedbackEventData } from "./event.types.js";

async function onFeedbackCreated(data: FeedbackEventData): Promise<void> {
  clearAnalyticsCache(data.workspaceId);
}

async function onFeedbackUpdated(data: FeedbackEventData): Promise<void> {
  clearAnalyticsCache(data.workspaceId);
}

async function onFeedbackDeleted(data: FeedbackEventData): Promise<void> {
  clearAnalyticsCache(data.workspaceId);
}

export function registerEventHandlers(): void {
  eventBus.on(FEEDBACK_CREATED, onFeedbackCreated);
  eventBus.on(FEEDBACK_UPDATED, onFeedbackUpdated);
  eventBus.on(FEEDBACK_DELETED, onFeedbackDeleted);
}
