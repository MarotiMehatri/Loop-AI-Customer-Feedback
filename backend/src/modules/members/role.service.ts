import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { MEMBER_MESSAGES } from "./member.constants.js";

import { logMemberActivity } from "./member.activity.js";

import { memberCache } from "./member.cache.js";

import { mapMember } from "./member.mapper.js";

import { memberRepository } from "./member.repository.js";

import { memberSocket } from "./member.socket.js";

export const roleService = {
  async changeRole(input: {
    memberId: string;
    workspaceId: string;
    actorUserId: string;
    role: Role;
  }) {
    if (input.memberId === input.actorUserId) {
      throw new ApiError(400, MEMBER_MESSAGES.cannotModifySelf);
    }

    const currentMember = await memberRepository.findById(
      input.memberId,
      input.workspaceId,
    );

    if (!currentMember) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    if (
      currentMember.role === "ADMIN" &&
      input.role !== "ADMIN" &&
      currentMember.isActive
    ) {
      const activeAdminCount = await memberRepository.countActiveAdmins(
        input.workspaceId,
      );

      if (activeAdminCount <= 1) {
        throw new ApiError(400, MEMBER_MESSAGES.cannotRemoveLastAdmin);
      }
    }

    const updated = await memberRepository.update(
      input.memberId,
      input.workspaceId,
      {
        role: input.role,
      },
    );

    if (!updated) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    memberCache.clearWorkspace(input.workspaceId);

    memberSocket.publish({
      event: "member:role-changed",
      workspaceId: input.workspaceId,
      memberId: updated.id,
      role: updated.role,
      createdAt: new Date(),
    });

    logMemberActivity({
      action: "MEMBER_ROLE_CHANGED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetUserId: updated.id,
      metadata: {
        previousRole: currentMember.role,
        newRole: updated.role,
      },
    });

    return mapMember(updated);
  },
};
