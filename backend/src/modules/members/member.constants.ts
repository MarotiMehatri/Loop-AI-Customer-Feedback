import type { Role } from "../../generated/prisma/client.js";

export const MEMBER_DEFAULT_PAGE = 1;
export const MEMBER_DEFAULT_LIMIT = 10;
export const MEMBER_MAX_LIMIT = 100;
export const MEMBER_INVITE_EXPIRY_HOURS = 72;

export const MEMBER_NAME_MIN = 2;
export const MEMBER_NAME_MAX = 100;
export const MEMBER_SEARCH_MAX = 200;
export const MEMBER_DEPARTMENT_MAX = 100;
export const MEMBER_JOB_TITLE_MAX = 100;
export const MEMBER_PHONE_MAX = 30;
export const MEMBER_BIO_MAX = 500;
export const MEMBER_LOCATION_MAX = 100;
export const MEMBER_TIMEZONE_MAX = 50;

export const MEMBER_MESSAGES = {
  listed: "Team members retrieved successfully",
  retrieved: "Team member retrieved successfully",
  updated: "Team member updated successfully",
  removed: "Team member removed successfully",
  roleUpdated: "Member role updated successfully",
  statusUpdated: "Member status updated successfully",
  invited: "Team member invited successfully",
  inviteResent: "Invitation resent successfully",
  inviteCancelled: "Invitation cancelled successfully",

  notFound: "Team member not found",
  inviteNotFound: "Invitation not found",
  alreadyMember: "A user with this email is already a workspace member",
  inviteExists: "A pending invitation already exists for this email",
  cannotModifySelf: "You cannot perform this action on your own account",
  cannotRemoveLastAdmin:
    "The workspace must have at least one active administrator",
  forbidden: "You do not have permission to manage team members",
} as const;

export const MANAGEABLE_MEMBER_ROLES: readonly Role[] = [
  "ADMIN",
  "ANALYST",
  "VIEWER",
];
