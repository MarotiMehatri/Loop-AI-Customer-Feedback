"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import { AdminShell } from "../_components/AdminShell";
import ui from "../_components/admin.module.css";

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

const BOOLEAN_FIELDS: Record<string, string[]> = {
  ai: ["enabled", "autoClassification", "sentimentAnalysis", "autoThemeDetection", "askLoopEnabled"],
  feedback: ["allowManualEntry", "allowCsvImport", "autoClassifyNewFeedback", "duplicateDetection"],
  reports: ["includeQuotes", "includeRecommendations", "autoGenerateWeekly"],
  security: ["requireStrongPasswords", "restrictEmailDomains"],
  notifications: Object.keys({ reportCreated: true, reportCompleted: true, reportFailed: true, feedbackImported: true, feedbackAssigned: true, memberInvited: true, memberRoleChanged: true, securityAlerts: true, workspaceUpdates: true }),
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [section, setSection] = useState<SectionKey>("general");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await apiClient.get<{ data: Settings }>("/settings");
      setSettings(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateValue = (key: string, value: string | number | boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: { ...settings[section], [key]: value },
    });
  };

  const saveSection = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const payload = { ...settings[section] };
      if (Array.isArray(payload.allowedEmailDomains)) {
        (payload as Record<string, unknown>).allowedEmailDomains = undefined;
      }
      await apiClient.patch(`/settings/${section}`, payload);
      toast.success(`${section} settings saved`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const resetSection = async () => {
    try {
      await apiClient.post(`/settings/${section}/reset`);
      toast.success(`${section} settings reset to defaults`);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const current = settings?.[section] ?? {};

  return (
    <AdminShell title="Settings" subtitle="Workspace settings and preferences" active="dashboard">
      <div className={ui.body}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {SECTIONS.map(([key, label]) => (
            <button
              key={key}
              className={ui.ghost}
              style={{
                background: section === key ? "#f6f3ff" : "#fff",
                borderColor: section === key ? "#5b2cf0" : "#e2e3ea",
                color: section === key ? "#4338ca" : "#344054",
              }}
              onClick={() => setSection(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <section className={ui.card}>
          <header>
            <div>
              <h2>{section} settings</h2>
              <p>Configure this section for the whole workspace</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={ui.ghost} onClick={resetSection}>Reset</button>
              <button className={ui.primary} onClick={saveSection} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </header>

          {!settings && <p className={ui.empty}>Loading settings…</p>}

          {settings && (
            <div className={ui.grid2}>
              {Object.entries(current).map(([key, value]) => {
                if (Array.isArray(value)) return null;
                const isBoolean = BOOLEAN_FIELDS[section]?.includes(key) || typeof value === "boolean";
                const isNumber = typeof value === "number";
                return (
                  <label key={key} className={ui.field}>
                    <span style={{ textTransform: "capitalize" }}>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                    </span>
                    {isBoolean ? (
                      <input
                        type="checkbox"
                        style={{ width: 18, height: 18, accentColor: "#5b2cf0", marginTop: 4 }}
                        checked={Boolean(value)}
                        onChange={(event) => updateValue(key, event.target.checked)}
                      />
                    ) : (
                      <input
                        className={ui.input}
                        type={isNumber ? "number" : "text"}
                        value={String(value)}
                        onChange={(event) => updateValue(key, isNumber ? Number(event.target.value) : event.target.value)}
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
