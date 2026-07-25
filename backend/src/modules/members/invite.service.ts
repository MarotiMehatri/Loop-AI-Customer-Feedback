import { ApiError } from "../../utils/apiError.js";

import { MEMBER_MESSAGES } from "./member.constants.js";

import {
  createInvitationExpiry,
  createInvitationToken,
  normalizeEmail,
} from "./member.helper.js";

import { logMemberActivity } from "./member.activity.js";

import { memberCache } from "./member.cache.js";

import { mapWorkspaceInvite } from "./member.mapper.js";

import { memberRepository } from "./member.repository.js";

import { memberSocket } from "./member.socket.js";

import type { InviteMemberInput } from "./member.types.js";

export const inviteService = {
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

    const existingInvite = await memberRepository.findPendingInvite(
      input.workspaceId,
      email,
    );

    if (existingInvite) {
      throw new ApiError(409, MEMBER_MESSAGES.inviteExists);
    }

    const { rawToken, tokenHash } = createInvitationToken();

    const invite = await memberRepository.createInvite({
      workspaceId: input.workspaceId,
      invitedById: input.actorUserId,
      email,
      role: input.invitation.role,
      tokenHash,
      expiresAt: createInvitationExpiry(),
    });

    memberCache.clearWorkspace(input.workspaceId);

    memberSocket.publish({
      event: "member:invited",
      workspaceId: input.workspaceId,
      email,
      role: input.invitation.role,
      createdAt: new Date(),
    });

    logMemberActivity({
      action: "MEMBER_INVITED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      targetEmail: email,
      metadata: {
        role: input.invitation.role,
      },
    });

    return {
      ...mapWorkspaceInvite(invite),

      /*
       * Send this token through your email service.
       * Do not store the raw token in the database.
       */
      invitationToken: rawToken,
    };
  },

  async resend(input: {
    inviteId: string;
    workspaceId: string;
    actorUserId: string;
  }) {
    const invite = await memberRepository.findInviteById(
      input.inviteId,
      input.workspaceId,
    );

    if (!invite) {
      throw new ApiError(404, MEMBER_MESSAGES.inviteNotFound);
    }

    const { rawToken, tokenHash } = createInvitationToken();

    const updated = await memberRepository.updateInviteToken(
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

    logMemberActivity({
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
    const result = await memberRepository.cancelInvite(
      input.inviteId,
      input.workspaceId,
    );

    if (result.count === 0) {
      throw new ApiError(404, MEMBER_MESSAGES.inviteNotFound);
    }

    memberCache.clearWorkspace(input.workspaceId);

    memberSocket.publish({
      event: "invite:cancelled",
      workspaceId: input.workspaceId,
      createdAt: new Date(),
    });

    logMemberActivity({
      action: "INVITE_CANCELLED",
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
    });
  },
};
