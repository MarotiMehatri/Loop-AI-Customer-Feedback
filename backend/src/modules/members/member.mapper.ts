import type { User, WorkspaceInvite } from "../../generated/prisma/client.js";

import { getPermissionsForRole } from "../../permissions/permission.service.js";

interface MemberRecord extends User {
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    reportNotifications: boolean;
    weeklySummary: boolean;
    theme: string;
    language: string;
    timezone: string;
  } | null;
}

export function mapMember(member: MemberRecord) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    isActive: member.isActive,
    workspaceId: member.workspaceId,

    avatarUrl: member.avatarUrl,
    phone: member.phone,
    bio: member.bio,
    jobTitle: member.jobTitle,
    department: member.department,
    location: member.location,
    timezone: member.timezone,

    lastLoginAt: member.lastLoginAt,
    lastActivityAt: member.updatedAt,

    permissions: getPermissionsForRole(member.role),

    preferences: member.preferences
      ? {
          emailNotifications: member.preferences.emailNotifications,
          pushNotifications: member.preferences.pushNotifications,
          reportNotifications: member.preferences.reportNotifications,
          weeklySummary: member.preferences.weeklySummary,
          theme: member.preferences.theme,
          language: member.preferences.language,
          timezone: member.preferences.timezone,
        }
      : null,

    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export function mapMembers(members: MemberRecord[]) {
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
