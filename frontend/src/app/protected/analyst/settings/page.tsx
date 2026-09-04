"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
ArrowLeft,
Bell,
Check,
ChevronRight,
Database,
Download,
Eye,
FileText,
Globe,
KeyRound,
Lock,
Mail,
Monitor,
Moon,
Palette,
Save,
Settings,
Shield,
Sun,
Trash2,
User,
Users,
Zap,
} from "lucide-react";

import { useAuthStore } from "../../../../store/authStore";
import styles from "./settings.module.css";

type SettingsState = {
emailNotifications: boolean;
feedbackAlerts: boolean;
weeklyReports: boolean;
productUpdates: boolean;
securityAlerts: boolean;
desktopNotifications: boolean;

compactMode: boolean;
reducedMotion: boolean;

autoRefresh: boolean;
autoSave: boolean;

showAnalyticsTips: boolean;
showWelcomeMessage: boolean;

timezone: string;
language: string;
dateFormat: string;
theme: "light" | "dark" | "system";
};

const DEFAULT_SETTINGS: SettingsState = {
emailNotifications: true,
feedbackAlerts: true,
weeklyReports: true,
productUpdates: false,
securityAlerts: true,
desktopNotifications: true,

compactMode: false,
reducedMotion: false,

autoRefresh: true,
autoSave: true,

showAnalyticsTips: true,
showWelcomeMessage: true,

timezone: "Asia/Kolkata",
language: "English",
dateFormat: "DD/MM/YYYY",
theme: "system",
};

function Toggle({
checked,
onChange,
label,
}: {
checked: boolean;
onChange: (value: boolean) => void;
label: string;
}) {
return (
<button
type="button"
className={`${styles.switch} ${
        checked ? styles.switchActive : ""
      }`}
onClick={() => onChange(!checked)}
aria-label={label}
aria-pressed={checked}
> <span className={styles.switchThumb} /> </button>
);
}

function SettingRow({
icon,
title,
description,
checked,
onChange,
}: {
icon: React.ReactNode;
title: string;
description: string;
checked: boolean;
onChange: (value: boolean) => void;
}) {
return ( <div className={styles.settingRow}> <div className={styles.settingRowLeft}> <div className={styles.settingIcon}>{icon}</div>

```
    <div className={styles.settingContent}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>

  <Toggle
    checked={checked}
    onChange={onChange}
    label={`Toggle ${title}`}
  />
</div>

);
}

export default function AnalystSettingsPage() {
const user = useAuthStore((state) => state.user);

const [settings, setSettings] =
useState<SettingsState>(DEFAULT_SETTINGS);

const [saved, setSaved] = useState(false);
const [saving, setSaving] = useState(false);

const [activeSection, setActiveSection] =
useState("general");

const [showDeleteConfirm, setShowDeleteConfirm] =
useState(false);

useEffect(() => {
try {
const stored = localStorage.getItem(
"loop-analyst-settings",
);

  if (!stored) return;

  const parsed = JSON.parse(stored);

  setSettings({
    ...DEFAULT_SETTINGS,
    ...parsed,
  });
} catch {
  setSettings(DEFAULT_SETTINGS);
}

}, []);

const updateSetting = <K extends keyof SettingsState>(
key: K,
value: SettingsState[K],
) => {
setSettings((current) => ({
...current,
[key]: value,
}));

setSaved(false);


};

const handleSave = async () => {
setSaving(true);
setSaved(false);


try {
  localStorage.setItem(
    "loop-analyst-settings",
    JSON.stringify(settings),
  );

  await new Promise((resolve) =>
    setTimeout(resolve, 700),
  );

  setSaved(true);

  setTimeout(() => {
    setSaved(false);
  }, 3500);
} finally {
  setSaving(false);
}

};

const resetSettings = () => {
setSettings(DEFAULT_SETTINGS);
setSaved(false);
};

const displayName =
user?.name ||
[user?.firstName, user?.lastName]
.filter(Boolean)
.join(" ") ||
"Analyst";

const initials =
displayName
.split(" ")
.filter(Boolean)
.slice(0, 2)
.map((part) => part[0])
.join("")
.toUpperCase() || "AN";

const sections = [
{
id: "general",
label: "General",
icon: <Settings size={17} />,
},
{
id: "notifications",
label: "Notifications",
icon: <Bell size={17} />,
},
{
id: "appearance",
label: "Appearance",
icon: <Palette size={17} />,
},
{
id: "analytics",
label: "Analytics",
icon: <Zap size={17} />,
},
{
id: "security",
label: "Security",
icon: <Shield size={17} />,
},
{
id: "data",
label: "Data & Privacy",
icon: <Database size={17} />,
},
];

return ( <main className={styles.page}> <div className={styles.backgroundGlowOne} /> <div className={styles.backgroundGlowTwo} />

```
  {/* =====================================================
      TOP BAR
  ===================================================== */}

  <header className={styles.topbar}>
    <div className={styles.topbarLeft}>
      <Link
        href="/protected/analyst"
        className={styles.backButton}
      >
        <ArrowLeft size={18} />
      </Link>

      <div className={styles.breadcrumb}>
        <span>Analyst</span>
        <ChevronRight size={14} />
        <strong>Settings</strong>
      </div>
    </div>

    <div className={styles.topbarRight}>
      {saved && (
        <div className={styles.savedMessage}>
          <Check size={16} />
          Settings saved
        </div>
      )}

      <button
        type="button"
        className={styles.saveButton}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <span className={styles.spinner} />
        ) : (
          <Save size={17} />
        )}

        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  </header>

  {/* =====================================================
      PAGE INTRO
  ===================================================== */}

  <section className={styles.pageIntro}>
    <div>
      <div className={styles.titleIcon}>
        <Settings size={24} />
      </div>

      <div>
        <h1>Settings</h1>
        <p>
          Manage your LOOP analyst workspace,
          notifications, preferences, and security.
        </p>
      </div>
    </div>

    <div className={styles.userMiniCard}>
      <div className={styles.userAvatar}>{initials}</div>

      <div>
        <strong>{displayName}</strong>
        <span>{user?.email || "Analyst account"}</span>
      </div>
    </div>
  </section>

  {/* =====================================================
      SETTINGS LAYOUT
  ===================================================== */}

  <div className={styles.settingsLayout}>
    {/* ===================================================
        SIDEBAR
    =================================================== */}

    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarLabel}>
          ACCOUNT SETTINGS
        </div>

        <nav className={styles.navigation}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.navItem} ${
                activeSection === section.id
                  ? styles.navItemActive
                  : ""
              }`}
              onClick={() =>
                setActiveSection(section.id)
              }
            >
              <span>{section.icon}</span>
              {section.label}

              {activeSection === section.id && (
                <ChevronRight
                  size={15}
                  className={styles.navArrow}
                />
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarDivider} />

        <Link
          href="/protected/analyst/profile"
          className={styles.profileLink}
        >
          <User size={17} />
          My Profile
          <ChevronRight size={15} />
        </Link>
      </div>
    </aside>

    {/* ===================================================
        CONTENT
    =================================================== */}

    <section className={styles.content}>
      {/* =================================================
          GENERAL
      ================================================= */}

      {activeSection === "general" && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderIcon}>
              <Globe size={20} />
            </div>

            <div>
              <h2>General Preferences</h2>
              <p>
                Configure language, timezone and regional
                preferences.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Regional Preferences</h3>
                <p>
                  These settings control how LOOP displays
                  dates and times.
                </p>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="language">
                  Language
                </label>

                <select
                  id="language"
                  value={settings.language}
                  onChange={(event) =>
                    updateSetting(
                      "language",
                      event.target.value,
                    )
                  }
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="timezone">
                  Timezone
                </label>

                <select
                  id="timezone"
                  value={settings.timezone}
                  onChange={(event) =>
                    updateSetting(
                      "timezone",
                      event.target.value,
                    )
                  }
                >
                  <option value="Asia/Kolkata">
                    India — Kolkata (IST)
                  </option>
                  <option value="UTC">
                    UTC
                  </option>
                  <option value="America/New_York">
                    New York (EST)
                  </option>
                  <option value="Europe/London">
                    London (GMT)
                  </option>
                  <option value="Asia/Singapore">
                    Singapore (SGT)
                  </option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="dateFormat">
                  Date Format
                </label>

                <select
                  id="dateFormat"
                  value={settings.dateFormat}
                  onChange={(event) =>
                    updateSetting(
                      "dateFormat",
                      event.target.value,
                    )
                  }
                >
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Workspace Behaviour</h3>
                <p>
                  Control how the analyst workspace behaves.
                </p>
              </div>
            </div>

            <SettingRow
              icon={<Monitor size={18} />}
              title="Compact Mode"
              description="Use a denser layout to display more feedback at once."
              checked={settings.compactMode}
              onChange={(value) =>
                updateSetting("compactMode", value)
              }
            />

            <SettingRow
              icon={<Save size={18} />}
              title="Auto Save"
              description="Automatically save filters, views and workspace preferences."
              checked={settings.autoSave}
              onChange={(value) =>
                updateSetting("autoSave", value)
              }
            />

            <SettingRow
              icon={<Zap size={18} />}
              title="Reduced Motion"
              description="Reduce interface animations and transition effects."
              checked={settings.reducedMotion}
              onChange={(value) =>
                updateSetting("reducedMotion", value)
              }
            />
          </div>
        </>
      )}

      {/* =================================================
          NOTIFICATIONS
      ================================================= */}

      {activeSection === "notifications" && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderIcon}>
              <Bell size={20} />
            </div>

            <div>
              <h2>Notifications</h2>
              <p>
                Choose what updates and alerts you receive
                from LOOP.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Notification Preferences</h3>
                <p>
                  Manage your email and application
                  notifications.
                </p>
              </div>
            </div>

            <SettingRow
              icon={<Mail size={18} />}
              title="Email Notifications"
              description="Receive important workspace updates by email."
              checked={settings.emailNotifications}
              onChange={(value) =>
                updateSetting(
                  "emailNotifications",
                  value,
                )
              }
            />

            <SettingRow
              icon={<Bell size={18} />}
              title="New Feedback Alerts"
              description="Get notified when new customer feedback arrives."
              checked={settings.feedbackAlerts}
              onChange={(value) =>
                updateSetting(
                  "feedbackAlerts",
                  value,
                )
              }
            />

            <SettingRow
              icon={<FileText size={18} />}
              title="Weekly Reports"
              description="Receive a weekly summary of feedback analytics."
              checked={settings.weeklyReports}
              onChange={(value) =>
                updateSetting(
                  "weeklyReports",
                  value,
                )
              }
            />

            <SettingRow
              icon={<Zap size={18} />}
              title="Product Updates"
              description="Receive news about new LOOP features and improvements."
              checked={settings.productUpdates}
              onChange={(value) =>
                updateSetting(
                  "productUpdates",
                  value,
                )
              }
            />

            <SettingRow
              icon={<Shield size={18} />}
              title="Security Alerts"
              description="Receive notifications about important account security events."
              checked={settings.securityAlerts}
              onChange={(value) =>
                updateSetting(
                  "securityAlerts",
                  value,
                )
              }
            />

            <SettingRow
              icon={<Monitor size={18} />}
              title="Desktop Notifications"
              description="Show browser notifications for important events."
              checked={settings.desktopNotifications}
              onChange={(value) =>
                updateSetting(
                  "desktopNotifications",
                  value,
                )
              }
            />
          </div>
        </>
      )}

      {/* =================================================
          APPEARANCE
      ================================================= */}

      {activeSection === "appearance" && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderIcon}>
              <Palette size={20} />
            </div>

            <div>
              <h2>Appearance</h2>
              <p>
                Customize how the LOOP interface looks.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Theme</h3>
                <p>
                  Select your preferred interface theme.
                </p>
              </div>
            </div>

            <div className={styles.themeGrid}>
              <button
                type="button"
                className={`${styles.themeOption} ${
                  settings.theme === "light"
                    ? styles.themeOptionActive
                    : ""
                }`}
                onClick={() =>
                  updateSetting("theme", "light")
                }
              >
                <div className={styles.themePreviewLight}>
                  <Sun size={28} />
                </div>

                <div>
                  <strong>Light</strong>
                  <span>Bright interface</span>
                </div>

                {settings.theme === "light" && (
                  <Check size={18} />
                )}
              </button>

              <button
                type="button"
                className={`${styles.themeOption} ${
                  settings.theme === "dark"
                    ? styles.themeOptionActive
                    : ""
                }`}
                onClick={() =>
                  updateSetting("theme", "dark")
                }
              >
                <div className={styles.themePreviewDark}>
                  <Moon size={28} />
                </div>

                <div>
                  <strong>Dark</strong>
                  <span>Dark interface</span>
                </div>

                {settings.theme === "dark" && (
                  <Check size={18} />
                )}
              </button>

              <button
                type="button"
                className={`${styles.themeOption} ${
                  settings.theme === "system"
                    ? styles.themeOptionActive
                    : ""
                }`}
                onClick={() =>
                  updateSetting("theme", "system")
                }
              >
                <div className={styles.themePreviewSystem}>
                  <Monitor size={28} />
                </div>

                <div>
                  <strong>System</strong>
                  <span>Use device preference</span>
                </div>

                {settings.theme === "system" && (
                  <Check size={18} />
                )}
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Accessibility</h3>
                <p>
                  Make the interface more comfortable to
                  use.
                </p>
              </div>
            </div>

            <SettingRow
              icon={<Zap size={18} />}
              title="Reduced Motion"
              description="Minimize animations throughout the application."
              checked={settings.reducedMotion}
              onChange={(value) =>
                updateSetting("reducedMotion", value)
              }
            />

            <SettingRow
              icon={<Monitor size={18} />}
              title="Compact Mode"
              description="Reduce spacing and display more information on screen."
              checked={settings.compactMode}
              onChange={(value) =>
                updateSetting("compactMode", value)
              }
            />
          </div>
        </>
      )}

      {/* =================================================
          ANALYTICS
      ================================================= */}

      {activeSection === "analytics" && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderIcon}>
              <Zap size={20} />
            </div>

            <div>
              <h2>Analytics Preferences</h2>
              <p>
                Control how your analyst dashboard loads
                and displays insights.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Dashboard Behaviour</h3>
                <p>
                  Configure real-time analytics behaviour.
                </p>
              </div>
            </div>

            <SettingRow
              icon={<Zap size={18} />}
              title="Auto Refresh"
              description="Automatically refresh analytics data when new information is available."
              checked={settings.autoRefresh}
              onChange={(value) =>
                updateSetting("autoRefresh", value)
              }
            />

            <SettingRow
              icon={<Eye size={18} />}
              title="Analytics Tips"
              description="Show helpful tips while exploring analytics."
              checked={settings.showAnalyticsTips}
              onChange={(value) =>
                updateSetting(
                  "showAnalyticsTips",
                  value,
                )
              }
            />

            <SettingRow
              icon={<User size={18} />}
              title="Welcome Message"
              description="Show personalized welcome information on your dashboard."
              checked={settings.showWelcomeMessage}
              onChange={(value) =>
                updateSetting(
                  "showWelcomeMessage",
                  value,
                )
              }
            />
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <Zap size={19} />
            </div>

            <div>
              <strong>AI-Powered Insights</strong>
              <p>
                LOOP analytics uses your workspace feedback
                data to generate trends, sentiment insights,
                themes and actionable recommendations.
              </p>
            </div>
          </div>
        </>
      )}

      {/* =================================================
          SECURITY
      ================================================= */}

      {activeSection === "security" && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderIcon}>
              <Shield size={20} />
            </div>

            <div>
              <h2>Security</h2>
              <p>
                Protect your LOOP account and workspace
                access.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Account Security</h3>
                <p>
                  Review your authentication and security
                  settings.
                </p>
              </div>

              <span className={styles.secureBadge}>
                <Shield size={14} />
                Protected
              </span>
            </div>

            <div className={styles.securityItem}>
              <div className={styles.securityItemIcon}>
                <Mail size={19} />
              </div>

              <div className={styles.securityInfo}>
                <strong>Email Address</strong>
                <span>
                  {user?.email || "No email available"}
                </span>
              </div>

              <span className={styles.statusBadge}>
                Verified
              </span>
            </div>

            <div className={styles.securityItem}>
              <div className={styles.securityItemIcon}>
                <KeyRound size={19} />
              </div>

              <div className={styles.securityInfo}>
                <strong>Password</strong>
                <span>
                  Keep your password strong and unique.
                </span>
              </div>

              <button
                type="button"
                className={styles.secondaryButton}
              >
                Change
              </button>
            </div>

            <div className={styles.securityItem}>
              <div className={styles.securityItemIcon}>
                <Lock size={19} />
              </div>

              <div className={styles.securityInfo}>
                <strong>Two-Factor Authentication</strong>
                <span>
                  Add an additional layer of protection.
                </span>
              </div>

              <button
                type="button"
                className={styles.secondaryButton}
              >
                Configure
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Active Sessions</h3>
                <p>
                  Devices currently connected to your
                  account.
                </p>
              </div>
            </div>

            <div className={styles.sessionItem}>
              <div className={styles.sessionIcon}>
                <Monitor size={20} />
              </div>

              <div className={styles.sessionInfo}>
                <strong>
                  Current browser session
                </strong>
                <span>
                  Windows · Chrome · Current session
                </span>
              </div>

              <span className={styles.currentBadge}>
                Current
              </span>
            </div>
          </div>
        </>
      )}

      {/* =================================================
          DATA & PRIVACY
      ================================================= */}

      {activeSection === "data" && (
        <>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderIcon}>
              <Database size={20} />
            </div>

            <div>
              <h2>Data & Privacy</h2>
              <p>
                Manage your LOOP data and privacy controls.
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Your Data</h3>
                <p>
                  Download a copy of your available account
                  data.
                </p>
              </div>
            </div>

            <div className={styles.dataAction}>
              <div className={styles.dataActionIcon}>
                <Download size={20} />
              </div>

              <div>
                <strong>Export Account Data</strong>
                <p>
                  Request a downloadable copy of your
                  profile and account information.
                </p>
              </div>

              <button
                type="button"
                className={styles.secondaryButton}
              >
                Export
              </button>
            </div>

            <div className={styles.dataAction}>
              <div className={styles.dataActionIcon}>
                <FileText size={20} />
              </div>

              <div>
                <strong>Feedback Data</strong>
                <p>
                  Your feedback and analytics data belongs
                  to your workspace.
                </p>
              </div>

              <Link
                href="/protected/analyst/data-sources"
                className={styles.secondaryButton}
              >
                View Data
              </Link>
            </div>
          </div>

          <div className={styles.dangerCard}>
            <div className={styles.dangerHeader}>
              <div className={styles.dangerIcon}>
                <Trash2 size={19} />
              </div>

              <div>
                <h3>Danger Zone</h3>
                <p>
                  These actions can affect your account.
                  Proceed carefully.
                </p>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() =>
                  setShowDeleteConfirm(true)
                }
              >
                <Trash2 size={17} />
                Delete Account
              </button>
            ) : (
              <div className={styles.deleteConfirm}>
                <strong>
                  Are you sure you want to continue?
                </strong>

                <p>
                  Account deletion should be connected to
                  your backend confirmation flow before this
                  action is made permanent.
                </p>

                <div className={styles.deleteActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() =>
                      setShowDeleteConfirm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() =>
                      setShowDeleteConfirm(false)
                    }
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* =================================================
          BOTTOM ACTIONS
      ================================================= */}

      <div className={styles.bottomActions}>
        <button
          type="button"
          className={styles.resetButton}
          onClick={resetSettings}
        >
          Reset Defaults
        </button>

        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <span className={styles.spinner} />
          ) : (
            <Save size={17} />
          )}

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  </div>
</main>

);
}
