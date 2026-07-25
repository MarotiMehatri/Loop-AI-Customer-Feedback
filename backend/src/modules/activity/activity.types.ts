import type {
  ActivityType,
  Role,
} from "../../generated/prisma/client.js";

export type ActivitySortField = "createdAt" | "title";

export type ActivitySortOrder = "asc" | "desc";

export interface ActivityActorContext {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface ActivityListQuery {
  page: number;
  limit: number;

  search?: string;
  type?: ActivityType;
  userId?: string;

  startDate?: Date;
  endDate?: Date;

  sortBy: ActivitySortField;
  sortOrder: ActivitySortOrder;
}

export interface RecentActivityQuery {
  limit: number;
  type?: ActivityType;
  userId?: string;
}

export interface ActivitySummaryQuery {
  userId?: string;
}

export interface ClearActivityInput {
  beforeDate?: Date;
  userId?: string;
}

export interface CreateActivityInput {
  userId: string;
  workspaceId: string;

  type: ActivityType;

  title: string;
  description?: string;

  entityType?: string;
  entityId?: string;

  metadata?: Record<string, unknown>;
}

export interface ActivityUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ActivityResponse {
  id: string;
  type: ActivityType;

  title: string;
  description: string | null;

  entityType: string | null;
  entityId: string | null;

  metadata: unknown;

  userId: string;
  workspaceId: string;

  user: ActivityUserResponse;

  createdAt: Date;
}

export interface ActivityTypeSummary {
  type: ActivityType;
  count: number;
}

export interface ActivitySummary {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;

  byType: ActivityTypeSummary[];
}
