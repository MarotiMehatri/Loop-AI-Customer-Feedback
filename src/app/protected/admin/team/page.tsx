"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Send, X } from "lucide-react";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import { AdminShell } from "../_components/AdminShell";
import ui from "../_components/admin.module.css";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  jobTitle?: string | null;
  department?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
}

interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const ROLES = ["ADMIN", "ANALYST", "VIEWER"];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#eef1ff",
  ANALYST: "#fef7e7",
  VIEWER: "#f0f5f0",
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: memberData }, { data: inviteData }] = await Promise.all([
        apiClient.get<{ data: Paginated<Member> }>("/members?limit=100"),
        apiClient.get<{ data: Paginated<Invite> }>("/members/invites?limit=100"),
      ]);
      setMembers(memberData.data.items);
      setInvites(inviteData.data.items);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const invite = async () => {
    try {
      await apiClient.post("/members/invite", { email, role });
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const changeRole = async (memberId: string, nextRole: string) => {
    try {
      await apiClient.patch(`/members/${memberId}/role`, { role: nextRole });
      toast.success("Role updated");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const toggleStatus = async (memberId: string, isActive: boolean) => {
    try {
      await apiClient.patch(`/members/${memberId}/status`, { isActive });
      toast.success(isActive ? "Member activated" : "Member deactivated");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const removeMember = async (memberId: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the team?`)) return;
    try {
      await apiClient.delete(`/members/${memberId}`);
      toast.success("Member removed");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const cancelInvite = async (inviteId: string) => {
    try {
      await apiClient.delete(`/members/invites/${inviteId}`);
      toast.success("Invitation cancelled");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const resendInvite = async (inviteId: string) => {
    try {
      await apiClient.post(`/members/invites/${inviteId}/resend`);
      toast.success("Invitation resent");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AdminShell title="Team" subtitle="Manage workspace members and invitations" active="dashboard">
      <div className={ui.body}>
        <section className={ui.card}>
          <header>
            <div>
              <h2>Invite a teammate</h2>
              <p>Send an email invitation with a role</p>
            </div>
          </header>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className={ui.field} style={{ flex: 1, minWidth: 260 }}>
              <span>Email address</span>
              <input
                className={ui.input}
                type="email"
                placeholder="teammate@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className={ui.field} style={{ width: 170 }}>
              <span>Role</span>
              <select className={ui.input} value={role} onChange={(event) => setRole(event.target.value)}>
                {ROLES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <button className={ui.primary} style={{ alignSelf: "flex-end" }} onClick={invite} disabled={!email}>
              <Send size={15} /> Invite
            </button>
          </div>
        </section>

        {invites.length > 0 && (
          <section className={ui.card}>
            <header>
              <div>
                <h2>Pending invitations</h2>
                <p>Invitations waiting to be accepted</p>
              </div>
            </header>
            <div className={ui.stack}>
              {invites.map((invite) => (
                <div key={invite.id} style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div className={ui.avatar}>
                      <Mail size={15} />
                    </div>
                    <div>
                      <b style={{ fontSize: 13, color: "#161723" }}>{invite.email}</b>
                      <p style={{ margin: 0, fontSize: 12, color: "#667085" }}>
                        {invite.role} · {invite.status.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className={ui.ghost} onClick={() => resendInvite(invite.id)}>Resend</button>
                    <button className={ui.ghost} onClick={() => cancelInvite(invite.id)}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={ui.card}>
          <header>
            <div>
              <h2>Members</h2>
              <p>{members.length} people in this workspace</p>
            </div>
          </header>
          {loading && <p className={ui.empty}>Loading team…</p>}
          {!loading && members.length === 0 && <p className={ui.empty}>No members yet.</p>}
          {!loading && members.length > 0 && (
            <div className={ui.tableWrap}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Last login</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div className={ui.avatar}>
                            {(member.name || member.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <b style={{ fontSize: 13, color: "#161723" }}>{member.name || member.email}</b>
                            <p style={{ margin: 0, fontSize: 12, color: "#667085" }}>{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={ui.badge} style={{ background: ROLE_COLORS[member.role] ?? "#eef1ff" }}>
                          {member.role}
                        </span>
                      </td>
                      <td style={{ color: "#667085", fontSize: 13 }}>
                        {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : "Never"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <select
                            className={ui.input}
                            style={{ width: 110, padding: "6px 8px" }}
                            value={member.role}
                            onChange={(event) => changeRole(member.id, event.target.value)}
                          >
                            {ROLES.map((item) => (
                              <option key={item} value={item}>{item}</option>
                            ))}
                          </select>
                          <button className={ui.ghost} onClick={() => toggleStatus(member.id, !member.isActive)}>
                            {member.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button className={ui.ghost} onClick={() => removeMember(member.id, member.name || member.email)}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
