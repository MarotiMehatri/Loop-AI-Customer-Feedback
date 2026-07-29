import { ActivityType } from "../../generated/prisma/client.js";

import { PERMISSION } from "../../permissions/permission.types.js";
import { assertPermission } from "../../permissions/rolePermissions.js";

import { activityLogger } from "../activity/activity.logger.js";

import { getDefaultSettingsSection } from "./settings.constants.js";

import {
  buildUpdatedSettingsSection,
  mapSettings,
  mapSettingsSection,
} from "./settings.mapper.js";

import { settingsRepository } from "./settings.repository.js";

import type {
  SettingsContext,
  SettingsSection,
  SettingsSectionUpdate,
} from "./settings.types.js";

export const settingsService = {
  async getAll(context: SettingsContext) {
    assertPermission(
      context.role,
      PERMISSION.SETTINGS_READ,
      "You do not have permission to view workspace settings",
    );

    const settings = await settingsRepository.ensure(context.workspaceId);

    return mapSettings(settings);
  },

  async getSection(context: SettingsContext, section: SettingsSection) {
    assertPermission(
      context.role,
      PERMISSION.SETTINGS_READ,
      "You do not have permission to view workspace settings",
    );

    const settings = await settingsRepository.ensure(context.workspaceId);

    return mapSettingsSection(settings, section);
  },

  async updateSection(
    context: SettingsContext,
    section: SettingsSection,
    input: SettingsSectionUpdate,
  ) {
    assertPermission(
      context.role,
      PERMISSION.SETTINGS_UPDATE,
      "You do not have permission to update workspace settings",
    );

    const currentRecord = await settingsRepository.ensure(context.workspaceId);

    const currentSection = mapSettingsSection(currentRecord, section);

    const updatedSection = buildUpdatedSettingsSection(
      section,
      currentSection,
      input,
    );

    const updatedRecord = await settingsRepository.updateSection(
      context.workspaceId,
      section,
      updatedSection,
    );

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.SETTINGS_UPDATED,
      title: "Workspace settings updated",
      description: `The ${section} settings were updated.`,
      entityType: "SETTINGS",
      entityId: context.workspaceId,
      metadata: {
        section,
        updatedFields: Object.keys(input),
      },
    });

    return mapSettingsSection(updatedRecord, section);
  },

  async resetSection(context: SettingsContext, section: SettingsSection) {
    assertPermission(
      context.role,
      PERMISSION.SETTINGS_RESET,
      "You do not have permission to reset workspace settings",
    );

    const defaultSection = getDefaultSettingsSection(section);

    const updatedRecord = await settingsRepository.updateSection(
      context.workspaceId,
      section,
      defaultSection,
    );

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.SETTINGS_UPDATED,
      title: "Workspace settings reset",
      description: `The ${section} settings were reset to their default values.`,
      entityType: "SETTINGS",
      entityId: context.workspaceId,
      metadata: {
        section,
        action: "RESET",
      },
    });

    return mapSettingsSection(updatedRecord, section);
  },
};
