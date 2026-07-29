import { createHash, randomBytes } from "node:crypto";

import { ApiError } from "../../utils/apiError.js";

import { MEMBER_INVITE_EXPIRY_HOURS, MEMBER_MESSAGES } from "./member.constants.js";

import { logMemberActivity } from "./member-activity.service.js";

import { mapWorkspaceInvite } from "./member.mapper.js";

import { memberRepository } from "./member.repository.js";

import { memberInviteRepository } from "./member-invite.repository.js";

import { eventBus } from "../../events/event-bus.js";

import { MEMBER_INVITED } from "../../events/event-names.js";

import type { InviteMemberInput } from "./member.types.js";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function createInvitationToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

function createInvitationExpiry(): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + MEMBER_INVITE_EXPIRY_HOURS);
  return expiresAt;
}

export const memberInviteService = {
  async invite(input: {
    workspaceId: string;
    actorUserId: string;
    invitation: InviteMemberInput;
  }) {
    const email = normalizeEmail(input.invitation.email);

    const existingMember = await memberRepository.findByEmail(
      email,
      input.workspaceId,
    );

    if (existingMember) {
      throw new ApiError(409, MEMBER_MESSAGES.alreadyMember);
    }

    const existingInvite = await memberInviteRepository.findPendingInvite(
      input.workspaceId,
      email,
    );

    if (existingInvite) {
      throw new ApiError(409, MEMBER_MESSAGES.inviteExists);
    }

    const { rawToken, tokenHash } = createInvitationToken();

    const invite = await memberInviteRepository.create({
      workspaceId: input.workspaceId,
      invitedById: input.actorUserId,
      email,
      role: input.invitation.role,
      tokenHash,
      expiresAt: createInvitationExpiry(),
    });

    await logMemberActivity({
      action: "MEMBER_INVITED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetEmail: email,
      metadata: { role: input.invitation.role },
    });

    eventBus.emit(MEMBER_INVITED, {
      userId: input.actorUserId,
      workspaceId: input.workspaceId,
      email,
    });

    return {
      ...mapWorkspaceInvite(invite),
      invitationToken: rawToken,
    };
  },

  async list(
    actor: { role: string; workspaceId: string },
    query: {
      page: number;
      limit: number;
      status?: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    },
  ) {
    const result = await memberInviteRepository.list(
      actor.workspaceId,
      query,
    );

    return {
      items: result.items.map(mapWorkspaceInvite),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async resend(input: {
    inviteId: string;
    workspaceId: string;
    actorUserId: string;
  }) {
    const invite = await memberInviteRepository.findById(
      input.inviteId,
      input.workspaceId,
    );

    if (!invite) {
      throw new ApiError(404, MEMBER_MESSAGES.inviteNotFound);
    }

    const { rawToken, tokenHash } = createInvitationToken();

    const updated = await memberInviteRepository.updateToken(
      input.inviteId,
      input.workspaceId,
      {
        tokenHash,
        expiresAt: createInvitationExpiry(),
      },
    );

    if (!updated) {
      throw new ApiError(404, MEMBER_MESSAGES.inviteNotFound);
    }

    await logMemberActivity({
      action: "INVITE_RESENT",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetEmail: updated.email,
    });

    return {
      ...mapWorkspaceInvite(updated),
      invitationToken: rawToken,
    };
  },

  async cancel(input: {
    inviteId: string;
    workspaceId: string;
    actorUserId: string;
  }): Promise<void> {
    const result = await memberInviteRepository.cancel(
      input.inviteId,
      input.workspaceId,
    );

    if (result.count === 0) {
      throw new ApiError(404, MEMBER_MESSAGES.inviteNotFound);
    }

    await logMemberActivity({
      action: "INVITE_CANCELLED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
    });
  },
};
