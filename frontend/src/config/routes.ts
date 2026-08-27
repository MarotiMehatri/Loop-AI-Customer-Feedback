export const routes = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forget-password",
    resetPassword: "/auth/reset-password",
  },

  admin: {
    dashboard: "/protected/admin/dashboard",
    inbox: "/protected/admin/inbox",
    addFeedback: "/protected/admin/add-feedback",
    analytics: "/protected/admin/analytics",
    askLoop: "/protected/admin/ask-loop",
    reports: "/protected/admin/reports",
    team: "/protected/admin/team",
    themes: "/protected/admin/themes",
    notifications: "/protected/admin/notifications",
    profile: "/protected/admin/profile",
    settings: "/protected/admin/settings",
  },

  unauthorized: "/protected/unauthorized",
} as const;