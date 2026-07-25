import type {
  DashboardQuickAction,
  DashboardRange,
} from "./dashboard.types.js";

export const DASHBOARD_RANGES = [
  "7d",
  "30d",
  "90d",
  "custom",
] as const satisfies readonly DashboardRange[];

export const DASHBOARD_DEFAULT_RANGE: DashboardRange = "7d";

export const DASHBOARD_DEFAULT_RECENT_LIMIT = 3;
export const DASHBOARD_MAX_RECENT_LIMIT = 20;

export const DASHBOARD_DEFAULT_TOP_THEMES_LIMIT = 5;
export const DASHBOARD_MAX_TOP_THEMES_LIMIT = 20;

export const DASHBOARD_MAX_CUSTOM_RANGE_DAYS = 366;
export const DASHBOARD_CACHE_TTL_MS = 60_000;

export const DASHBOARD_SENTIMENT_LABELS = {
  POS: "Positive",
  NEU: "Neutral",
  NEG: "Negative",
} as const;

export const DASHBOARD_SOURCE_LABELS = {
  SUPPORT: "Support Ticket",
  APP_STORE: "App Store",
  SURVEY: "Survey",
  SALES: "Sales",
  SOCIAL: "Social",
  WEBSITE: "Website",
  EMAIL: "Email",
  MANUAL: "Manual",
} as const;

export const DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    key: "ADD_FEEDBACK",
    label: "Add Feedback",
    description: "Create a new customer feedback record.",
    route: "/feedback/new",
  },
  {
    key: "UPLOAD_CSV",
    label: "Upload CSV",
    description: "Import customer feedback from a CSV file.",
    route: "/feedback/import",
  },
  {
    key: "ASK_LOOP",
    label: "Ask LOOP AI",
    description: "Ask questions across workspace feedback.",
    route: "/ask-loop",
  },
  {
    key: "VIEW_REPORTS",
    label: "View Reports",
    description: "Open generated and scheduled reports.",
    route: "/reports",
  },
];

export const DASHBOARD_MESSAGES = {
  retrieved: "Admin dashboard retrieved successfully",
  summaryRetrieved: "Dashboard summary retrieved successfully",
  chartsRetrieved: "Dashboard charts retrieved successfully",
  themesRetrieved: "Dashboard themes retrieved successfully",
  feedbackRetrieved: "Recent feedback retrieved successfully",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
  adminRequired: "Only workspace administrators can access the Admin dashboard",
} as const;
