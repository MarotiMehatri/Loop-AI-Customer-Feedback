import { logger } from "../../config/logger.js";

import type { MemberActivityData } from "./member.types.js";

export function logMemberActivity(activity: MemberActivityData): void {
  logger.info({
    module: "members",
    action: activity.action,
    workspaceId: activity.workspaceId,
    actorUserId: activity.actorUserId,
    targetUserId: activity.targetUserId,
    targetEmail: activity.targetEmail,
    metadata: activity.metadata,
  });
}
