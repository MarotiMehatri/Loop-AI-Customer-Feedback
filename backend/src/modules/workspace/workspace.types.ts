import type { Role } from "../../generated/prisma/client.js";

export interface WorkspaceContext {
  userId: string;
  email: string;
  workspaceId: string;
  role: Role;
}

export interface UpdateWorkspaceInput {
  name: string;
}

export interface DeleteWorkspaceInput {
  confirmation: string;
}

export interface CreateWorkspaceInput {
  name: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettingsResponse {
  general: Record<string, unknown>;
  ai: Record<string, unknown>;
  feedback: Record<string, unknown>;
  reports: Record<string, unknown>;
  security: Record<string, unknown>;
  retention: Record<string, unknown>;
  notifications: Record<string, unknown>;
}

export interface WorkspaceFullResponse extends WorkspaceResponse {
  settings: WorkspaceSettingsResponse | null;
  memberCount: number;
  feedbackCount: number;
}

export interface WorkspaceSummary {
  members: number;
  activeMembers: number;
  feedback: number;
  themes: number;
  reports: number;
}

export interface WorkspaceOverview {
  workspace: WorkspaceFullResponse;
  summary: WorkspaceSummary;
  recentActivity: RecentActivityItem[];
  feedbackTrend: FeedbackTrend[];
  topThemes: TopTheme[];
  departmentDistribution: DepartmentCount[];
}

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  userName: string | null;
  createdAt: Date;
}

export interface FeedbackTrend {
  date: string;
  count: number;
}

export interface TopTheme {
  id: string;
  name: string;
  count: number;
}

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  database: ComponentHealth;
  uptime: number;
  lastChecked: Date;
}

export interface ComponentHealth {
  status: "healthy" | "degraded" | "unhealthy";
  latencyMs: number;
  message?: string;
}

export interface UsageStats {
  period: "daily" | "weekly" | "monthly";
  activeUsers: number;
  totalFeedbacks: number;
  feedbacksThisPeriod: number;
  aiClassifications: number;
  reportsGenerated: number;
  exportsCreated: number;
  apiCalls: number;
  storageUsedBytes: number;
}

export interface SwitchWorkspaceResult {
  token: string;
  workspace: WorkspaceResponse;
}

export interface AvailableWorkspace {
  id: string;
  name: string;
  slug: string;
  role: Role;
}
