import { prisma } from "../../config/prisma.js";

import type { MemberActivityData } from "./member.types.js";

const activityTypeMap: Record<MemberActivityData["action"], string> = {
  MEMBER_INVITED: "MEMBER_INVITED",
  MEMBER_UPDATED: "MEMBER_UPDATED",
  MEMBER_ROLE_CHANGED: "MEMBER_ROLE_CHANGED",
  MEMBER_STATUS_CHANGED: "MEMBER_STATUS_CHANGED",
  MEMBER_REMOVED: "MEMBER_REMOVED",
  INVITE_RESENT: "INVITE_RESENT",
  INVITE_CANCELLED: "INVITE_CANCELLED",
};

const activityTitleMap: Record<MemberActivityData["action"], string> = {
  MEMBER_INVITED: "Member invited",
  MEMBER_UPDATED: "Member updated",
  MEMBER_ROLE_CHANGED: "Member role changed",
  MEMBER_STATUS_CHANGED: "Member status changed",
  MEMBER_REMOVED: "Member removed",
  INVITE_RESENT: "Invitation resent",
  INVITE_CANCELLED: "Invitation cancelled",
};

export async function logMemberActivity(
  activity: MemberActivityData,
): Promise<void> {
  const type = activityTypeMap[activity.action];
  const title = activityTitleMap[activity.action];

  await prisma.activityLog
    .create({
      data: {
        userId: activity.actorUserId,
        workspaceId: activity.workspaceId,
        type: type as never,
        title,
        description: activity.targetEmail
          ? `${title}: ${activity.targetEmail}`
          : title,
        metadata: {
          ...activity.metadata,
          action: activity.action,
          targetUserId: activity.targetUserId,
          targetEmail: activity.targetEmail,
        },
      },
    })
    .catch(() => {});
}
