import { ApiError } from "../../utils/apiError.js";

import {
  assertCanManageMembers,
  assertCanViewMembers,
} from "./member.permissions.js";

import { MEMBER_MESSAGES } from "./member.constants.js";

import { logMemberActivity } from "./member-activity.service.js";

import { mapMember, mapMembers } from "./member.mapper.js";

import { memberRepository } from "./member.repository.js";

import type { MemberListQuery, UpdateMemberInput } from "./member.types.js";

function normalizeMemberName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

export const memberService = {
  async list(
    actor: { role: string; workspaceId: string },
    query: MemberListQuery,
  ) {
    assertCanViewMembers(actor.role as never);

    const result = await memberRepository.list(actor.workspaceId, query);

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

  async getById(
    actor: { role: string; workspaceId: string },
    memberId: string,
  ) {
    assertCanViewMembers(actor.role as never);

    const member = await memberRepository.findById(
      memberId,
      actor.workspaceId,
    );

    if (!member) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    return mapMember(member);
  },

  async update(input: {
    memberId: string;
    workspaceId: string;
    actorUserId: string;
    actorRole: string;
    data: UpdateMemberInput;
  }) {
    assertCanManageMembers(input.actorRole as never);

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

    const normalized: UpdateMemberInput = {
      ...input.data,
      name:
        input.data.name !== undefined
          ? normalizeMemberName(input.data.name)
          : undefined,
    };

    const updated = await memberRepository.update(
      input.memberId,
      input.workspaceId,
      normalized,
    );

    if (!updated) {
      throw new ApiError(404, MEMBER_MESSAGES.notFound);
    }

    logMemberActivity({
      action: "MEMBER_UPDATED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetUserId: updated.id,
      metadata: {
        name: input.data.name,
        role: input.data.role,
        isActive: input.data.isActive,
      },
    });

    return mapMember(updated);
  },

  async remove(input: {
    memberId: string;
    workspaceId: string;
    actorUserId: string;
    actorRole: string;
  }): Promise<void> {
    assertCanManageMembers(input.actorRole as never);

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

    logMemberActivity({
      action: "MEMBER_REMOVED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetUserId: input.memberId,
    });
  },

  async getSummary(
    actor: { role: string; workspaceId: string },
  ) {
    assertCanViewMembers(actor.role as never);

    return memberRepository.getSummary(actor.workspaceId);
  },
};
