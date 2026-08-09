import type { Prisma } from "../../generated/prisma/client.js";

import type { ProfileResponse } from "./profile.types.js";

type ProfileRecord = Prisma.UserGetPayload<{
  include: {
    preferences: true;
  };
}>;

export function mapProfile(user: ProfileRecord): ProfileResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,

    avatarUrl: user.avatarUrl,
    phone: user.phone,
    bio: user.bio,
    jobTitle: user.jobTitle,
    department: user.department,
    location: user.location,
    timezone: user.timezone,

    workspaceId: user.workspaceId,

    preferences: user.preferences
      ? {
          emailNotifications: user.preferences.emailNotifications,

          pushNotifications: user.preferences.pushNotifications,

          reportNotifications: user.preferences.reportNotifications,

          weeklySummary: user.preferences.weeklySummary,

          theme: user.preferences.theme,

          language: user.preferences.language,

          timezone: user.preferences.timezone,
        }
      : null,

    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapPreference(preference: {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reportNotifications: boolean;
  weeklySummary: boolean;
  theme: "LIGHT" | "DARK" | "SYSTEM";
  language: "ENGLISH" | "HINDI";
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    emailNotifications: preference.emailNotifications,

    pushNotifications: preference.pushNotifications,

    reportNotifications: preference.reportNotifications,

    weeklySummary: preference.weeklySummary,

    theme: preference.theme,

    language: preference.language,

    timezone: preference.timezone,

    createdAt: preference.createdAt,
    updatedAt: preference.updatedAt,
  };
}
