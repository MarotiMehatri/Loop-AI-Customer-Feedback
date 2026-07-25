import type { User, WorkspaceInvite } from "../../generated/prisma/client.js";

import { getPermissionsForRole } from "../../permissions/permission.service.js";

export function mapMember(member: User) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    isActive: member.isActive,
    workspaceId: member.workspaceId,

    permissions: getPermissionsForRole(member.role),

    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export function mapMembers(members: User[]) {
  return members.map(mapMember);
}

export function mapWorkspaceInvite(invite: WorkspaceInvite) {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    expiresAt: invite.expiresAt,
    acceptedAt: invite.acceptedAt,
    invitedById: invite.invitedById,
    workspaceId: invite.workspaceId,
    createdAt: invite.createdAt,
    updatedAt: invite.updatedAt,
  };
}
