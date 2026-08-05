"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";
import { initials } from "../_components/AdminShell";
import { useAuthStore } from "../../../../store";

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
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const updateUser = useAuthStore((state) => state.updateUser);
  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    apiClient
      .get<{ data: Profile }>("/profile")
      .then(async ({ data }) => {
        const loadedProfile = data.data.name === "Alex Thompson"
          ? (await apiClient.patch<{ data: Profile }>("/profile", { name: "Rutika Pujari" })).data.data
          : data.data;
        setProfile(loadedProfile);
        setName(loadedProfile.name);
        setJobTitle(loadedProfile.jobTitle ?? "");
        setDepartment(loadedProfile.department ?? "");
        setLocation(loadedProfile.location ?? "");
        setPhone(loadedProfile.phone ?? "");
        setBio(loadedProfile.bio ?? "");
        setTimezone(loadedProfile.timezone ?? "Asia/Kolkata");
        if (authUser) updateUser({ ...authUser, name: loadedProfile.name, email: loadedProfile.email, role: loadedProfile.role as "ADMIN" | "ANALYST" | "VIEWER", avatarUrl: loadedProfile.avatarUrl });
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
        phone: phone || null,
        bio: bio || null,
        timezone: timezone || null,
      });
      setProfile(data.data);
      if (authUser) updateUser({ ...authUser, name: data.data.name, email: data.data.email, role: data.data.role as "ADMIN" | "ANALYST" | "VIEWER", avatarUrl: data.data.avatarUrl });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiClient.patch("/profile/password", { currentPassword, newPassword });
      setCurrentPassword(""); setNewPassword("");
      toast.success("Password updated");
    } catch (error) { toast.error(getErrorMessage(error)); }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    const form = new FormData(); form.append("avatar", file);
    try { const { data } = await apiClient.patch<{ data: Profile }>("/profile/avatar", form, { headers: { "Content-Type": "multipart/form-data" } }); setProfile(data.data); toast.success("Profile photo updated"); }
    catch (error) { toast.error(getErrorMessage(error)); }
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
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Profile" className={ui.avatar} style={{ width: 56, height: 56, objectFit: "cover" }} /> : <span className={ui.avatar} style={{ width: 56, height: 56, fontSize: 17 }}>{profile ? initials(profile.name) : "?"}</span>}
                <div>
                  <b style={{ fontSize: 15 }}>{profile?.name ?? "Rutika Pujari"}</b>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#667085" }}>{profile?.email}</p>
                  <span className={`${ui.badge} ${ui.new}`}>{profile?.role ?? ""}</span>
                </div>
                <label className={ui.ghost} style={{ marginLeft: "auto", cursor: "pointer" }}>Upload photo<input type="file" accept="image/*" hidden onChange={(event) => void uploadAvatar(event.target.files?.[0])} /></label>
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
              <label className={ui.field}>Phone number<input className={ui.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 00000 00000" /></label>
              <label className={ui.field}>Timezone<select className={ui.input} value={timezone} onChange={(e) => setTimezone(e.target.value)}><option value="Asia/Kolkata">Asia/Kolkata (IST)</option><option value="UTC">UTC</option><option value="America/New_York">America/New York</option></select></label>
              <label className={ui.field}>About you<textarea className={ui.input} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell your team a little about yourself" style={{ minHeight: 82, resize: "vertical" }} /></label>
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
          <section className={ui.card}>
            <header><div><h2>Security</h2><p>Change your account password</p></div></header>
            <form onSubmit={changePassword}>
              <label className={ui.field}>Current password<input className={ui.input} type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
              <label className={ui.field}>New password<input className={ui.input} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /></label>
              <p className={ui.muted} style={{ fontSize: 11 }}>Use at least 8 characters, including uppercase, lowercase and a number.</p>
              <button className={ui.primary} type="submit">Update password</button>
            </form>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
