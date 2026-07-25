import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import {
  DEFAULT_AI_SETTINGS,
  DEFAULT_FEEDBACK_SETTINGS,
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_REPORT_SETTINGS,
  DEFAULT_RETENTION_SETTINGS,
  DEFAULT_SECURITY_SETTINGS,
} from "./settings.defaults.js";

import { toSettingsJson } from "./settings.helper.js";

import type {
  SettingsSection,
  SettingsSectionValue,
} from "./settings.types.js";

function buildDefaultCreateData(
  workspaceId: string,
): Prisma.WorkspaceSettingsUncheckedCreateInput {
  return {
    workspaceId,

    general: toSettingsJson(DEFAULT_GENERAL_SETTINGS),

    ai: toSettingsJson(DEFAULT_AI_SETTINGS),

    feedback: toSettingsJson(DEFAULT_FEEDBACK_SETTINGS),

    reports: toSettingsJson(DEFAULT_REPORT_SETTINGS),

    security: toSettingsJson(DEFAULT_SECURITY_SETTINGS),

    retention: toSettingsJson(DEFAULT_RETENTION_SETTINGS),

    notifications: toSettingsJson(DEFAULT_NOTIFICATION_SETTINGS),
  };
}

function buildSectionUpdateData(
  section: SettingsSection,
  value: SettingsSectionValue,
): Prisma.WorkspaceSettingsUpdateInput {
  const jsonValue = toSettingsJson(value);

  switch (section) {
    case "general":
      return {
        general: jsonValue,
      };

    case "ai":
      return {
        ai: jsonValue,
      };

    case "feedback":
      return {
        feedback: jsonValue,
      };

    case "reports":
      return {
        reports: jsonValue,
      };

    case "security":
      return {
        security: jsonValue,
      };

    case "retention":
      return {
        retention: jsonValue,
      };

    case "notifications":
      return {
        notifications: jsonValue,
      };
  }
}

async function findByWorkspaceId(workspaceId: string) {
  return prisma.workspaceSettings.findUnique({
    where: {
      workspaceId,
    },
  });
}

async function ensureSettings(workspaceId: string) {
  return prisma.workspaceSettings.upsert({
    where: {
      workspaceId,
    },

    create: buildDefaultCreateData(workspaceId),

    update: {},
  });
}

async function updateSection(
  workspaceId: string,
  section: SettingsSection,
  value: SettingsSectionValue,
) {
  await ensureSettings(workspaceId);

  return prisma.workspaceSettings.update({
    where: {
      workspaceId,
    },

    data: buildSectionUpdateData(section, value),
  });
}

export const settingsRepository = {
  findByWorkspaceId,
  ensure: ensureSettings,
  updateSection,
};
