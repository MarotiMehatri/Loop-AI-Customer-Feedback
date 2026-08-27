import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Bot,
  FileText,
  Grid2X2,
  Inbox,
  Plus,
  Settings2,
  Users,
} from "lucide-react";

import type { Role } from "../Features/Auth/auth.types";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

export interface NavigationSection {
  label: string;
  items: NavigationItem[];
}

export const ADMIN_NAVIGATION: NavigationSection[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/protected/admin/dashboard",
        icon: Grid2X2,
        roles: ["ADMIN", "ANALYST", "VIEWER"],
      },
      {
        label: "Inbox",
        href: "/protected/admin/inbox",
        icon: Inbox,
        roles: ["ADMIN", "ANALYST", "VIEWER"],
      },
      {
        label: "Add Feedback",
        href: "/protected/admin/add-feedback",
        icon: Plus,
        roles: ["ADMIN", "ANALYST"],
      },
      {
        label: "Analytics",
        href: "/protected/admin/analytics",
        icon: BarChart3,
        roles: ["ADMIN", "ANALYST", "VIEWER"],
      },
      {
        label: "Ask LOOP AI",
        href: "/protected/admin/ask-loop",
        icon: Bot,
        roles: ["ADMIN", "ANALYST", "VIEWER"],
      },
      {
        label: "Reports",
        href: "/protected/admin/reports",
        icon: FileText,
        roles: ["ADMIN", "ANALYST", "VIEWER"],
      },
    ],
  },

  {
    label: "Management",
    items: [
      {
        label: "Team",
        href: "/protected/admin/team",
        icon: Users,
        roles: ["ADMIN"],
      },
    ],
  },

  {
    label: "System",
    items: [
      {
        label: "Notifications",
        href: "/protected/admin/notifications",
        icon: Bell,
        roles: ["ADMIN", "ANALYST", "VIEWER"],
      },
      {
        label: "Settings",
        href: "/protected/admin/settings",
        icon: Settings2,
        roles: ["ADMIN", "ANALYST"],
      },
    ],
  },
];

export function getNavigationForRole(
  role: Role | undefined,
): NavigationSection[] {
  const currentRole = role ?? "VIEWER";

  return ADMIN_NAVIGATION
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles.includes(currentRole),
      ),
    }))
    .filter((section) => section.items.length > 0);
}