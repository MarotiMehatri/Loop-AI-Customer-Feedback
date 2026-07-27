export const SOURCES = {
  SUPPORT: "SUPPORT",
  APP_STORE: "APP_STORE",
  SURVEY: "SURVEY",
  SALES: "SALES",
  SOCIAL: "SOCIAL",
  WEBSITE: "WEBSITE",
  EMAIL: "EMAIL",
  MANUAL: "MANUAL",
} as const;

export type Source = (typeof SOURCES)[keyof typeof SOURCES];

export const SOURCE_LABELS: Record<Source, string> = {
  [SOURCES.SUPPORT]: "Support",
  [SOURCES.APP_STORE]: "App Store",
  [SOURCES.SURVEY]: "Survey",
  [SOURCES.SALES]: "Sales",
  [SOURCES.SOCIAL]: "Social Media",
  [SOURCES.WEBSITE]: "Website",
  [SOURCES.EMAIL]: "Email",
  [SOURCES.MANUAL]: "Manual",
};

export const SOURCE_ICONS: Record<Source, string> = {
  [SOURCES.SUPPORT]: "headset",
  [SOURCES.APP_STORE]: "smartphone",
  [SOURCES.SURVEY]: "clipboard-list",
  [SOURCES.SALES]: "shopping-cart",
  [SOURCES.SOCIAL]: "share-2",
  [SOURCES.WEBSITE]: "globe",
  [SOURCES.EMAIL]: "mail",
  [SOURCES.MANUAL]: "edit",
};
