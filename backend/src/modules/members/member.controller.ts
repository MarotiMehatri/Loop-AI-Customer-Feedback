import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { memberInviteService } from "./member-invite.service.js";

import { memberPermissionService } from "./member-permission.service.js";

import { memberService } from "./member.service.js";

import type {
  InviteMemberInput,
  MemberListQuery,
  UpdateMemberInput,
} from "./member.types.js";

const getRequestContext = (request: Request) => {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, "Authentication required");
  }

  if (!workspaceId) {
    throw new ApiError(400, "Workspace is required");
  }

  return { userId, workspaceId, role };
};

export const listMembersController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { role, workspaceId } = getRequestContext(request);

  const result = await memberService.list(
    { role, workspaceId },
    request.query as unknown as MemberListQuery,
  );

  response.status(200).json({
    success: true,
    message: "Team members retrieved successfully",
    data: result,
  });
};

export const getMemberController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { role, workspaceId } = getRequestContext(request);

  const result = await memberService.getById(
    { role, workspaceId },
    request.params.memberId as string,
  );

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const updateMemberController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId, role } = getRequestContext(request);

  const result = await memberService.update({
    memberId: request.params.memberId as string,
    workspaceId,
    actorUserId: userId,
    actorRole: role,
    data: request.body as UpdateMemberInput,
  });

  response.status(200).json({
    success: true,
    message: "Team member updated successfully",
    data: result,
  });
};

export const removeMemberController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId, role } = getRequestContext(request);

  await memberService.remove({
    memberId: request.params.memberId as string,
    workspaceId,
    actorUserId: userId,
    actorRole: role,
  });

  response.status(200).json({
    success: true,
    message: "Team member removed successfully",
  });
};

export const memberSummaryController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { role, workspaceId } = getRequestContext(request);

  const result = await memberService.getSummary({ role, workspaceId });

  response.status(200).json({
    success: true,
    data: result,
  });
};

export const inviteMemberController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getRequestContext(request);

  const result = await memberInviteService.invite({
    workspaceId,
    actorUserId: userId,
    invitation: request.body as InviteMemberInput,
  });

  response.status(201).json({
    success: true,
    message: "Team member invited successfully",
    data: result,
  });
};

export const listInvitesController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { role, workspaceId } = getRequestContext(request);

  const result = await memberInviteService.list(
    { role, workspaceId },
    request.query as unknown as {
      page: number;
      limit: number;
      status?: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    },
  );

  response.status(200).json({
    success: true,
    message: "Invitations retrieved successfully",
    data: result,
  });
};

export const resendInviteController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getRequestContext(request);

  const result = await memberInviteService.resend({
    inviteId: request.params.inviteId as string,
    workspaceId,
    actorUserId: userId,
  });

  response.status(200).json({
    success: true,
    message: "Invitation resent successfully",
    data: result,
  });
};

export const cancelInviteController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getRequestContext(request);

  await memberInviteService.cancel({
    inviteId: request.params.inviteId as string,
    workspaceId,
    actorUserId: userId,
  });

  response.status(200).json({
    success: true,
    message: "Invitation cancelled successfully",
  });
};

export const changeMemberRoleController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId } = getRequestContext(request);

  const result = await memberPermissionService.changeRole({
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
};

export const changeMemberStatusController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { userId, workspaceId, role } = getRequestContext(request);

  const result = await memberService.update({
    memberId: request.params.memberId as string,
    workspaceId,
    actorUserId: userId,
    actorRole: role,
    data: { isActive: request.body.isActive },
  });

  response.status(200).json({
    success: true,
    message: "Member status updated successfully",
    data: result,
  });
};
