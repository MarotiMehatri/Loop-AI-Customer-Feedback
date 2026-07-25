import type {
  ActivityType,
  Role,
  Language,
  UserTheme,
} from "../../generated/prisma/client.js";

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  location?: string | null;
  timezone?: string | null;
}

export interface UpdateAvatarInput {
  avatarUrl: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesInput {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  reportNotifications?: boolean;
  weeklySummary?: boolean;
  theme?: UserTheme;
  language?: Language;
  timezone?: string;
}

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;

  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  jobTitle: string | null;
  department: string | null;
  location: string | null;
  timezone: string | null;

  workspaceId: string;

  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    reportNotifications: boolean;
    weeklySummary: boolean;
    theme: UserTheme;
    language: Language;
    timezone: string;
  } | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileStatistics {
  feedbackManaged: number;
  reportsGenerated: number;
  teamMembers: number;
  workspaces: number;
}

export interface ProfileActivityQuery {
  page: number;
  limit: number;
}

export interface ProfileActivityInput {
  userId: string;
  workspaceId: string;
  type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}
