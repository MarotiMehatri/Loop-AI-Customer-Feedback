import type { Role } from "../generated/prisma/client.js";

import type { MemberPermissions } from "../modules/members/member.types.js";

const ADMIN_PERMISSIONS: MemberPermissions = {
  canManageWorkspace: true,
  canManageMembers: true,
  canManageSettings: true,
  canManageFeedback: true,
  canViewAnalytics: true,
  canGenerateReports: true,
  canUseAskLoop: true,
  canExportData: true,
};

const ANALYST_PERMISSIONS: MemberPermissions = {
  canManageWorkspace: false,
  canManageMembers: false,
  canManageSettings: false,
  canManageFeedback: true,
  canViewAnalytics: true,
  canGenerateReports: true,
  canUseAskLoop: true,
  canExportData: true,
};

const VIEWER_PERMISSIONS: MemberPermissions = {
  canManageWorkspace: false,
  canManageMembers: false,
  canManageSettings: false,
  canManageFeedback: false,
  canViewAnalytics: true,
  canGenerateReports: false,
  canUseAskLoop: true,
  canExportData: false,
};

export function getPermissionsForRole(role: Role): MemberPermissions {
  switch (role) {
    case "ADMIN":
      return { ...ADMIN_PERMISSIONS };

    case "ANALYST":
      return { ...ANALYST_PERMISSIONS };

    case "VIEWER":
      return { ...VIEWER_PERMISSIONS };
  }
}

export function canManageMembers(role: Role): boolean {
  return getPermissionsForRole(role).canManageMembers;
}
