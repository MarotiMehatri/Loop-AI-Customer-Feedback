export const ROLES = {
  ADMIN: "ADMIN",
  ANALYST: "ANALYST",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.ANALYST]: "Analyst",
  [ROLES.VIEWER]: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [ROLES.ADMIN]: "Full access to workspace, members, and settings",
  [ROLES.ANALYST]: "Can view analytics, generate reports, and manage feedback",
  [ROLES.VIEWER]: "Read-only access to the workspace",
};
