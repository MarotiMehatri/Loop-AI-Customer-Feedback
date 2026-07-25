import type { RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { inviteService } from "./invite.service.js";

import { memberService } from "./member.service.js";

import { roleService } from "./role.service.js";

import type {
  InviteMemberInput,
  MemberListQuery,
  UpdateMemberInput,
} from "./member.types.js";

function getRequestContext(request: Parameters<RequestHandler>[0]) {
  const userId = request.user?.userId;

  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, "Authentication required");
  }

  if (!workspaceId) {
    throw new ApiError(400, "Workspace is required");
  }

  return {
    userId,
    workspaceId,
    role,
  };
}

export const memberController: {
  list: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
  summary: RequestHandler;
  invite: RequestHandler;
  resendInvite: RequestHandler;
  cancelInvite: RequestHandler;
  changeRole: RequestHandler;
  changeStatus: RequestHandler;
} = {
  list: async (request, response, next) => {
    try {
      const { workspaceId } = getRequestContext(request);

      const result = await memberService.list(
        workspaceId,
        request.query as unknown as MemberListQuery,
      );

      response.status(200).json({
        success: true,
        message: "Team members retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (request, response, next) => {
    try {
      const { workspaceId } = getRequestContext(request);

      const result = await memberService.getById(
        request.params.memberId as string,
        workspaceId,
      );

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const result = await memberService.update({
        memberId: request.params.memberId as string,

        workspaceId,
        actorUserId: userId,

        data: request.body as UpdateMemberInput,
      });

      response.status(200).json({
        success: true,
        message: "Team member updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  remove: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      await memberService.remove({
        memberId: request.params.memberId as string,

        workspaceId,
        actorUserId: userId,
      });

      response.status(200).json({
        success: true,
        message: "Team member removed successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  summary: async (request, response, next) => {
    try {
      const { workspaceId } = getRequestContext(request);

      const result = await memberService.getSummary(workspaceId);

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  invite: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const result = await inviteService.invite({
        workspaceId,
        actorUserId: userId,

        invitation: request.body as InviteMemberInput,
      });

      response.status(201).json({
        success: true,
        message: "Team member invited successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  resendInvite: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const result = await inviteService.resend({
        inviteId: request.params.inviteId as string,

        workspaceId,
        actorUserId: userId,
      });

      response.status(200).json({
        success: true,
        message: "Invitation resent successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  cancelInvite: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      await inviteService.cancel({
        inviteId: request.params.inviteId as string,

        workspaceId,
        actorUserId: userId,
      });

      response.status(200).json({
        success: true,
        message: "Invitation cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  changeRole: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const result = await roleService.changeRole({
        memberId: request.params.memberId as string,

        workspaceId,
        actorUserId: userId,
        role: request.body.role,
      });

      response.status(200).json({
        success: true,
        message: "Member role updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  changeStatus: async (request, response, next) => {
    try {
      const { userId, workspaceId } = getRequestContext(request);

      const result = await memberService.update({
        memberId: request.params.memberId as string,

        workspaceId,
        actorUserId: userId,

        data: {
          isActive: request.body.isActive,
        },
      });

      response.status(200).json({
        success: true,
        message: "Member status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
