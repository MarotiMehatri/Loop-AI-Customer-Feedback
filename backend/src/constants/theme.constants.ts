export const THEME_STATUSES = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type ThemeStatus = (typeof THEME_STATUSES)[keyof typeof THEME_STATUSES];

export const THEME_STATUS_LABELS: Record<ThemeStatus, string> = {
  [THEME_STATUSES.ACTIVE]: "Active",
  [THEME_STATUSES.ARCHIVED]: "Archived",
};

export const THEME_DEFAULTS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_KEYWORDS: 10,
  MIN_CLUSTER_SIZE: 3,
} as const;
