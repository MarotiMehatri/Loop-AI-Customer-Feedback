"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bot,
  Bell,
  Database,
  FileText,
  RotateCcw,
  Save,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import styles from "./settings.module.css";

interface Settings {
  general: Record<string, string | number>;
  ai: Record<string, string | number | boolean>;
  feedback: Record<string, string | number | boolean>;
  reports: Record<string, string | number | boolean>;
  security: Record<string, string | number | boolean | string[]>;
  retention: Record<string, number>;
  notifications: Record<string, boolean>;
}

const SECTIONS = [
  ["general", "General"],
  ["ai", "AI"],
  ["feedback", "Feedback"],
  ["reports", "Reports"],
  ["security", "Security"],
  ["retention", "Retention"],
  ["notifications", "Notifications"],
] as const;

type SectionKey = (typeof SECTIONS)[number][0];

const SECTION_ICONS: Record<SectionKey, typeof SlidersHorizontal> = {
  general: SlidersHorizontal,
  ai: Bot,
  feedback: Database,
  reports: FileText,
  security: Shield,
  retention: RotateCcw,
  notifications: Bell,
};

const SECTION_DESCRIPTIONS: Record<SectionKey, string> = {
  general:
    "Configure general workspace behaviour, defaults and organization preferences.",
  ai: "Control AI-powered analysis, classification, themes and Ask LOOP AI.",
  feedback:
    "Configure how feedback is collected, imported, classified and processed.",
  reports:
    "Control report generation, recommendations, quotes and scheduled reports.",
  security:
    "Manage password requirements, email-domain restrictions and workspace security.",
  retention:
    "Configure how long feedback and related workspace data should be retained.",
  notifications:
    "Choose which workspace and system events should generate notifications.",
};

const BOOLEAN_FIELDS: Record<string, string[]> = {
  ai: [
    "enabled",
    "autoClassification",
    "sentimentAnalysis",
    "autoThemeDetection",
    "askLoopEnabled",
  ],

  feedback: [
    "allowManualEntry",
    "allowCsvImport",
    "autoClassifyNewFeedback",
    "duplicateDetection",
  ],

  reports: ["includeQuotes", "includeRecommendations", "autoGenerateWeekly"],

  security: ["requireStrongPasswords", "restrictEmailDomains"],

  notifications: [
    "reportCreated",
    "reportCompleted",
    "reportFailed",
    "feedbackImported",
    "feedbackAssigned",
    "memberInvited",
    "memberRoleChanged",
    "securityAlerts",
    "workspaceUpdates",
  ],
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  enabled: "Enable AI processing across the workspace.",
  autoClassification: "Automatically classify new feedback.",
  sentimentAnalysis: "Analyze positive, neutral and negative sentiment.",
  autoThemeDetection: "Automatically detect recurring feedback themes.",
  askLoopEnabled: "Enable the Ask LOOP AI assistant.",
  allowManualEntry: "Allow users to manually submit feedback.",
  allowCsvImport: "Allow CSV feedback imports.",
  autoClassifyNewFeedback: "Automatically classify newly received feedback.",
  duplicateDetection: "Detect possible duplicate feedback submissions.",
  includeQuotes: "Include customer quotes in generated reports.",
  includeRecommendations: "Include AI recommendations in reports.",
  autoGenerateWeekly: "Automatically generate weekly reports.",
  requireStrongPasswords: "Require stronger passwords for workspace users.",
  restrictEmailDomains: "Restrict invitations to approved email domains.",
  reportCreated: "Notify when a report is created.",
  reportCompleted: "Notify when report generation finishes.",
  reportFailed: "Notify when report generation fails.",
  feedbackImported: "Notify when feedback imports complete.",
  feedbackAssigned: "Notify when feedback is assigned.",
  memberInvited: "Notify when a new member is invited.",
  memberRoleChanged: "Notify when a member role changes.",
  securityAlerts: "Notify about important security events.",
  workspaceUpdates: "Notify about workspace configuration updates.",
};

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function isArrayValue(value: unknown): value is string[] {
  return Array.isArray(value);
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<Settings | null>(
    null,
  );

  const [section, setSection] = useState<SectionKey>("general");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newDomain, setNewDomain] = useState("");

  const load = async () => {
    setLoading(true);

    try {
      const { data } = await apiClient.get<{ data: Settings }>("/settings");

      setSettings(data.data);
      setOriginalSettings(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateValue = (
    key: string,
    value: string | number | boolean | string[],
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  const current = settings?.[section] ?? {};

  const hasChanges = useMemo(() => {
    if (!settings || !originalSettings) return false;

    return (
      JSON.stringify(settings[section]) !==
      JSON.stringify(originalSettings[section])
    );
  }, [settings, originalSettings, section]);

  const saveSection = async () => {
    if (!settings) return;

    setSaving(true);

    try {
      const payload = {
        ...settings[section],
      };

      await apiClient.patch(`/settings/${section}`, payload);

      setOriginalSettings({
        ...originalSettings!,
        [section]: {
          ...settings[section],
        },
      });

      toast.success(`${formatLabel(section)} settings saved successfully`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const resetSection = async () => {
    const confirmed = window.confirm(
      `Reset ${formatLabel(section)} settings to the workspace defaults?`,
    );

    if (!confirmed) return;

    setSaving(true);

    try {
      await apiClient.post(`/settings/${section}/reset`);

      toast.success(`${formatLabel(section)} settings reset to defaults`);

      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const addDomain = (key: string) => {
    const domain = newDomain.trim().toLowerCase();

    if (!domain) {
      toast.error("Enter an email domain first");
      return;
    }

    if (!domain.includes(".")) {
      toast.error("Enter a valid domain, for example example.com");
      return;
    }

    const value = current[key];

    const existing = isArrayValue(value) ? value : [];

    if (existing.includes(domain)) {
      toast.error("This domain is already added");
      return;
    }

    updateValue(key, [...existing, domain]);
    setNewDomain("");
  };

  const removeDomain = (key: string, domain: string) => {
    const value = current[key];

    if (!isArrayValue(value)) return;

    updateValue(
      key,
      value.filter((item) => item !== domain),
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.body}>
        {/* Page heading */}
        <div className={styles.pageHeader}>
          <div className={styles.titleBlock}>
            <h1>Workspace settings</h1>
            <p>
              Manage your LOOP workspace configuration, AI behaviour, security,
              notifications and data retention.
            </p>
          </div>

          {settings && (
            <div className={styles.status}>
              <span className={styles.statusDot} />
              Settings connected
            </div>
          )}
        </div>

        <div className={styles.settingsLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarTitle}>Configuration</div>

            <nav className={styles.sectionList}>
              {SECTIONS.map(([key, label]) => {
                const Icon = SECTION_ICONS[key];

                const active = section === key;

                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.sectionButton} ${
                      active ? styles.sectionButtonActive : ""
                    }`}
                    onClick={() => setSection(key)}
                  >
                    <span className={styles.sectionIcon}>
                      <Icon size={14} />
                    </span>

                    <span className={styles.sectionLabel}>{label}</span>

                    {active && <span className={styles.sectionArrow}>›</span>}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <div className={styles.heading}>
                <h2>{formatLabel(section)} settings</h2>

                <p>{SECTION_DESCRIPTIONS[section]}</p>
              </div>

              <div className={styles.actions}>
                {hasChanges && (
                  <span className={styles.unsaved}>
                    <span className={styles.unsavedDot} />
                    Unsaved changes
                  </span>
                )}

                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => void resetSection()}
                  disabled={saving || loading}
                >
                  <RotateCcw size={13} />
                  Reset
                </button>

                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => void saveSection()}
                  disabled={saving || loading || !hasChanges}
                >
                  <Save size={13} />

                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </header>

            <div className={styles.content}>
              <div className={styles.sectionDescription}>
                <strong>Workspace-wide configuration</strong>
                {" — "}
                Changes made here can affect users, feedback processing, AI
                analysis and workspace notifications.
              </div>

              {loading && (
                <div className={styles.loading}>
                  <span className={styles.spinner} />
                  Loading workspace settings...
                </div>
              )}

              {!loading && !settings && (
                <div className={styles.empty}>
                  <p className={styles.emptyTitle}>Settings unavailable</p>

                  <p className={styles.emptyText}>
                    We could not load workspace settings. Please try again.
                  </p>
                </div>
              )}

              {!loading && settings && (
                <div className={styles.settingsGrid}>
                  {Object.entries(current).map(([key, value]) => {
                    const isBoolean =
                      BOOLEAN_FIELDS[section]?.includes(key) ||
                      typeof value === "boolean";

                    const isNumber = typeof value === "number";

                    const isArray = isArrayValue(value);

                    /*
                     * Array fields such as
                     * allowedEmailDomains.
                     */
                    if (isArray) {
                      return (
                        <div
                          key={key}
                          className={`${styles.settingItem} ${styles.arrayField}`}
                        >
                          <div className={styles.arrayHeader}>
                            <div>
                              <span className={styles.settingLabel}>
                                {formatLabel(key)}
                              </span>

                              <span className={styles.settingKey}>
                                {FIELD_DESCRIPTIONS[key] ??
                                  "Manage values for this setting."}
                              </span>
                            </div>
                          </div>

                          <div className={styles.arrayList}>
                            {value.length === 0 && (
                              <span className={styles.settingKey}>
                                No values configured
                              </span>
                            )}

                            {value.map((item) => (
                              <span key={item} className={styles.arrayItem}>
                                {item}

                                <button
                                  type="button"
                                  className={styles.removeItem}
                                  onClick={() => removeDomain(key, item)}
                                  aria-label={`Remove ${item}`}
                                >
                                  <X size={11} />
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className={styles.arrayInputRow}>
                            <input
                              className={styles.input}
                              value={newDomain}
                              onChange={(event) =>
                                setNewDomain(event.target.value)
                              }
                              placeholder="example.com"
                            />

                            <button
                              type="button"
                              className={styles.addButton}
                              onClick={() => addDomain(key)}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      );
                    }

                    /*
                     * Boolean fields.
                     */
                    if (isBoolean) {
                      return (
                        <div key={key} className={styles.settingItem}>
                          <span className={styles.settingLabel}>
                            {formatLabel(key)}
                          </span>

                          <div className={styles.booleanRow}>
                            <div className={styles.booleanInfo}>
                              <span className={styles.booleanValue}>
                                {Boolean(value) ? "Enabled" : "Disabled"}
                              </span>

                              <p className={styles.booleanDescription}>
                                {FIELD_DESCRIPTIONS[key] ??
                                  "Enable or disable this workspace feature."}
                              </p>
                            </div>

                            <input
                              type="checkbox"
                              className={styles.toggle}
                              checked={Boolean(value)}
                              onChange={(event) =>
                                updateValue(key, event.target.checked)
                              }
                              aria-label={formatLabel(key)}
                            />
                          </div>
                        </div>
                      );
                    }

                    /*
                     * Number and text fields.
                     */
                    return (
                      <label key={key} className={styles.settingItem}>
                        <span className={styles.settingLabel}>
                          {formatLabel(key)}

                          {FIELD_DESCRIPTIONS[key] && (
                            <span className={styles.settingKey}>
                              {FIELD_DESCRIPTIONS[key]}
                            </span>
                          )}
                        </span>

                        <input
                          className={styles.input}
                          type={isNumber ? "number" : "text"}
                          value={String(value)}
                          onChange={(event) =>
                            updateValue(
                              key,
                              isNumber
                                ? Number(event.target.value)
                                : event.target.value,
                            )
                          }
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
