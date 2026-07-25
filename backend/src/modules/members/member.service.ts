import { ApiError } from "../../utils/apiError.js";

import { MEMBER_MESSAGES } from "./member.constants.js";

import { normalizeMemberName } from "./member.helper.js";

import { logMemberActivity } from "./member.activity.js";

import { memberCache } from "./member.cache.js";

import { mapMember, mapMembers } from "./member.mapper.js";

import { memberRepository } from "./member.repository.js";

import { memberSocket } from "./member.socket.js";

import type { MemberListQuery, UpdateMemberInput } from "./member.types.js";

export const memberService = {
  async list(workspaceId: string, query: MemberListQuery) {
    const result = await memberRepository.list(workspaceId, query);

    return {
      items: mapMembers(result.items),

      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async getById(memberId: string, workspaceId: string) {
    const member = await memberRepository.findById(memberId, workspaceId);

    if (!member) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    return mapMember(member);
  },

  async update(input: {
    memberId: string;
    workspaceId: string;
    actorUserId: string;
    data: UpdateMemberInput;
  }) {
    if (
      input.memberId === input.actorUserId &&
      (input.data.role !== undefined || input.data.isActive !== undefined)
    ) {
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
      currentMember.isActive &&
      ((input.data.role !== undefined && input.data.role !== "ADMIN") ||
        input.data.isActive === false)
    ) {
      const adminCount = await memberRepository.countActiveAdmins(
        input.workspaceId,
      );

      if (adminCount <= 1) {
        throw new ApiError(400, MEMBER_MESSAGES.cannotRemoveLastAdmin);
      }
    }

    const updated = await memberRepository.update(
      input.memberId,
      input.workspaceId,
      {
        ...input.data,

        name:
          input.data.name !== undefined
            ? normalizeMemberName(input.data.name)
            : undefined,
      },
    );

    if (!updated) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    memberCache.clearWorkspace(input.workspaceId);

    memberSocket.publish({
      event: "member:updated",
      workspaceId: input.workspaceId,
      memberId: updated.id,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: new Date(),
    });

    logMemberActivity({
      action: "MEMBER_UPDATED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetUserId: updated.id,
    });

    return mapMember(updated);
  },

  async remove(input: {
    memberId: string;
    workspaceId: string;
    actorUserId: string;
  }): Promise<void> {
    if (input.memberId === input.actorUserId) {
      throw new ApiError(400, MEMBER_MESSAGES.cannotModifySelf);
    }

    const member = await memberRepository.findById(
      input.memberId,
      input.workspaceId,
    );

    if (!member) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    if (member.role === "ADMIN" && member.isActive) {
      const adminCount = await memberRepository.countActiveAdmins(
        input.workspaceId,
      );

      if (adminCount <= 1) {
        throw new ApiError(400, MEMBER_MESSAGES.cannotRemoveLastAdmin);
      }
    }

    const result = await memberRepository.remove(
      input.memberId,
      input.workspaceId,
    );

    if (result.count === 0) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    memberCache.clearWorkspace(input.workspaceId);

    memberSocket.publish({
      event: "member:removed",
      workspaceId: input.workspaceId,
      memberId: input.memberId,
      createdAt: new Date(),
    });

    logMemberActivity({
      action: "MEMBER_REMOVED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetUserId: input.memberId,
    });
  },

  async getSummary(workspaceId: string) {
    const cacheKey = `member-summary:${workspaceId}`;

    const cached = memberCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const summary = await memberRepository.getSummary(workspaceId);

    memberCache.set(cacheKey, summary);

    return summary;
  },
};
