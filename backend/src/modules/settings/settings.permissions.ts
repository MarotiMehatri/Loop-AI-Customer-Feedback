import { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { SETTINGS_MESSAGES } from "./settings.constants.js";

import type { SettingsContext } from "./settings.types.js";

export function assertCanViewSettings(context: SettingsContext): void {
  if (context.role !== Role.ADMIN) {
    throw new ApiError(403, SETTINGS_MESSAGES.adminRequired);
  }
}

export function assertCanManageSettings(context: SettingsContext): void {
  if (context.role !== Role.ADMIN) {
    throw new ApiError(403, SETTINGS_MESSAGES.adminRequired);
  }
}
