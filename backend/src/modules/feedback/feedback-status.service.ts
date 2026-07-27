import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { emitFeedbackEvent, createFeedbackEvent } from "./feedback.events.js";
import type { FeedbackStatus } from "./feedback.types.js";

const VALID_TRANSITIONS: Record<string, string[]> = {
  NEW: ["OPEN", "CLOSED"],
  OPEN: ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED: ["CLOSED"],
  CLOSED: ["OPEN"],
};

export async function changeFeedbackStatus(
  feedbackId: string,
  workspaceId: string,
  newStatus: FeedbackStatus,
  userId: string,
): Promise<{ status: string }> {
  const feedback = await prisma.feedback.findFirst({
    where: { id: feedbackId, workspaceId },
    select: { id: true, status: true },
  });

  if (!feedback) {
    throw new ApiError(404, "Feedback not found");
  }

  const allowed = VALID_TRANSITIONS[feedback.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot transition from "${feedback.status}" to "${newStatus}". Allowed: ${allowed.join(", ") || "none"}`,
    );
  }

  const updated = await prisma.feedback.update({
    where: { id: feedbackId },
    data: { status: newStatus },
    select: { id: true, status: true },
  });

  emitFeedbackEvent(
    createFeedbackEvent("STATUS_CHANGED", updated.id, workspaceId, userId, {
      oldStatus: feedback.status,
      newStatus: updated.status,
    }),
  );

  return { status: updated.status };
}
