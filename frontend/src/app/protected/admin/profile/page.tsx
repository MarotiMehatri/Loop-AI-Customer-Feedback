"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";
import { initials } from "../_components/AdminShell";

import { AdminShell } from "../_components/AdminShell";
import ui from "../_components/admin.module.css";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  phone: string | null;
  bio: string | null;
  jobTitle: string | null;
  department: string | null;
  location: string | null;
  timezone: string | null;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    reportNotifications: boolean;
    weeklySummary: boolean;
  } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ data: Profile }>("/profile")
      .then(({ data }) => {
        setProfile(data.data);
        setName(data.data.name);
        setJobTitle(data.data.jobTitle ?? "");
        setDepartment(data.data.department ?? "");
        setLocation(data.data.location ?? "");
      })
      .catch(() => undefined);
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await apiClient.patch<{ data: Profile }>("/profile", {
        name,
        jobTitle: jobTitle || null,
        department: department || null,
        location: location || null,
      });
      setProfile(data.data);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Profile" subtitle="Your account details and preferences" active="dashboard">
      <div className={ui.body}>
        <div className={ui.grid2}>
          <section className={ui.card}>
            <header>
              <div>
                <h2>Profile information</h2>
                <p>Your public profile details</p>
              </div>
            </header>
            <form onSubmit={handleSave}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <span className={ui.avatar} style={{ width: 56, height: 56, fontSize: 17 }}>
                  {profile ? initials(profile.name) : "?"}
                </span>
                <div>
                  <b style={{ fontSize: 15 }}>{profile?.name ?? "…"}</b>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#667085" }}>{profile?.email}</p>
                  <span className={`${ui.badge} ${ui.new}`}>{profile?.role ?? ""}</span>
                </div>
              </div>
              <label className={ui.field}>
                Full name
                <input className={ui.input} value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label className={ui.field}>
                Job title
                <input className={ui.input} value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </label>
              <label className={ui.field}>
                Department
                <input className={ui.input} value={department} onChange={(e) => setDepartment(e.target.value)} />
              </label>
              <label className={ui.field}>
                Location
                <input className={ui.input} value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>
              <button className={ui.primary} type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </section>

          <section className={ui.card}>
            <header>
              <div>
                <h2>Preferences</h2>
                <p>Notification preferences for your account</p>
              </div>
            </header>
            <div className={ui.stack}>
              {profile && [
                ["emailNotifications", "Email notifications", "Product and account updates via email"],
                ["pushNotifications", "Push notifications", "Real-time alerts in the browser"],
                ["reportNotifications", "Report notifications", "When generated reports are ready"],
                ["weeklySummary", "Weekly summary", "A digest of the week's feedback every Monday"],
              ].map(([key, label, description]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f2f2f6" }}>
                  <input
                    type="checkbox"
                    style={{ width: 17, height: 17, accentColor: "#5b2cf0" }}
                    checked={Boolean(profile.preferences?.[key as keyof Profile["preferences"]])}
                    onChange={async (event) => {
                      const optimistic = { ...profile, preferences: { ...profile.preferences!, [key]: event.target.checked } };
                      setProfile(optimistic as Profile);
                      try {
                        await apiClient.patch("/profile/preferences", { [key]: event.target.checked });
                        toast.success(`${label} updated`);
                      } catch (error) {
                        toast.error(getErrorMessage(error));
                      }
                    }}
                  />
                  <div>
                    <b style={{ fontSize: 13 }}>{label}</b>
                    <p style={{ margin: 0, fontSize: 11, color: "#98a2b3" }}>{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
