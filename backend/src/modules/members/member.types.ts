import type {
  Role,
  WorkspaceInviteStatus,
} from "../../generated/prisma/client.js";

export const MEMBER_SORT_FIELDS = [
  "name",
  "email",
  "role",
  "department",
  "isActive",
  "lastLoginAt",
  "createdAt",
  "updatedAt",
] as const;

export const MEMBER_SORT_ORDERS = ["asc", "desc"] as const;

export type MemberSortField = (typeof MEMBER_SORT_FIELDS)[number];
export type MemberSortOrder = (typeof MEMBER_SORT_ORDERS)[number];

export interface MemberListQuery {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  department?: string;
  isActive?: boolean;
  sortBy: MemberSortField;
  sortOrder: MemberSortOrder;
}

export interface UpdateMemberInput {
  name?: string;
  role?: Role;
  isActive?: boolean;
  department?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  timezone?: string | null;
  avatarUrl?: string | null;
}

export interface InviteMemberInput {
  email: string;
  role: Role;
}

export interface ChangeMemberRoleInput {
  role: Role;
}

export interface ChangeMemberStatusInput {
  isActive: boolean;
}

export interface MemberPermissions {
  canManageWorkspace: boolean;
  canManageMembers: boolean;
  canManageSettings: boolean;
  canManageFeedback: boolean;
  canViewAnalytics: boolean;
  canGenerateReports: boolean;
  canUseAskLoop: boolean;
  canExportData: boolean;
}

export interface MemberSummary {
  total: number;
  active: number;
  inactive: number;
  administrators: number;
  analysts: number;
  viewers: number;
  pendingInvites: number;
  departments: DepartmentSummary[];
}

export interface DepartmentSummary {
  department: string;
  count: number;
}

export interface WorkspaceInviteResult {
  id: string;
  email: string;
  role: Role;
  status: WorkspaceInviteStatus;
  expiresAt: Date;
  createdAt: Date;
  invitationToken?: string;
}

export interface MemberActivityData {
  action:
    | "MEMBER_INVITED"
    | "MEMBER_UPDATED"
    | "MEMBER_ROLE_CHANGED"
    | "MEMBER_STATUS_CHANGED"
    | "MEMBER_REMOVED"
    | "INVITE_RESENT"
    | "INVITE_CANCELLED";
  workspaceId: string;
  actorUserId: string;
  targetUserId?: string;
  targetEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceAccess {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: Role;
}
