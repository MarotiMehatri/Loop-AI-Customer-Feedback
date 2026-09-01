"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Eye,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { format, isWithinInterval, subDays } from "date-fns";
import { toast } from "sonner";

import { getErrorMessage } from "../../../../lib/api/api-error";
import { useAuthStore } from "../../../../store";
import {
  cancelInvite,
  getTeamInvites,
  getTeamMembers,
  inviteMember,
  removeMember,
  resendInvite,
  updateMemberRole,
  updateMemberStatus,
} from "../../../../Features/team/api/team.api";
import type {
  TeamInvite,
  TeamMember,
  TeamRole,
} from "../../../../Features/team/team.types";
import styles from "./team.module.css";

const ROLES: TeamRole[] = ["ADMIN", "ANALYST", "VIEWER"];
const ROLE_LABELS: Record<TeamRole, string> = {
  ADMIN: "Administrator",
  ANALYST: "Analyst",
  VIEWER: "Viewer",
};

const ROLE_COLORS: Record<TeamRole, string> = {
  ADMIN: "purple",
  ANALYST: "blue",
  VIEWER: "violet",
};

function initials(name: string, email = "") {
  const value = name.trim() || email.trim() || "LOOP";
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function safeDate(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Never" : format(date, "MMM d, yyyy");
}

function relativeLastActive(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  const minutes = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 60000),
  );
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function roleLabel(role: string) {
  return ROLE_LABELS[role as TeamRole] ?? role;
}

function MetricCard({
  icon,
  label,
  value,
  change,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  tone: string;
}) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</div>
      <div className={styles.metricText}>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{change}</small>
      </div>
    </article>
  );
}

function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span className={`${styles.roleBadge} ${styles[ROLE_COLORS[role]]}`}>
      {roleLabel(role)}
    </span>
  );
}

export default function AnalystTeamPage() {
  const user = useAuthStore((state) => state.user);
  const currentRole = (user?.role ?? "ANALYST") as TeamRole;
  const canManage = currentRole === "ADMIN";

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | TeamRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("VIEWER");
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [memberResult, inviteResult] = await Promise.all([
        getTeamMembers({ page: 1, limit: 100 }),
        getTeamInvites({ page: 1, limit: 100 }),
      ]);
      setMembers(memberResult.items);
      setInvites(
        inviteResult.items.filter((item) => item.status === "PENDING"),
      );
    } catch (error) {
      console.error("Analyst team load failed", error);
      toast.error(getErrorMessage(error));
      setMembers([]);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (member.department ?? "").toLowerCase().includes(query) ||
        (member.jobTitle ?? "").toLowerCase().includes(query);
      const matchesRole = roleFilter === "ALL" || member.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? member.isActive : !member.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, roleFilter, search, statusFilter]);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((member) => member.isActive).length;
    const admins = members.filter((member) => member.role === "ADMIN").length;
    const analysts = members.filter(
      (member) => member.role === "ANALYST",
    ).length;
    const viewers = members.filter((member) => member.role === "VIEWER").length;
    const weekAgo = subDays(new Date(), 7);
    const newMembers = members.filter((member) => {
      const date = new Date(member.createdAt);
      return (
        !Number.isNaN(date.getTime()) &&
        isWithinInterval(date, { start: weekAgo, end: new Date() })
      );
    }).length;
    return { total, active, admins, analysts, viewers, newMembers };
  }, [members]);

  const roleRows = useMemo(
    () => [
      {
        role: "ADMIN" as TeamRole,
        count: stats.admins,
        description: "Full access to workspace administration",
        permissions: "Members, settings, workspace",
      },
      {
        role: "ANALYST" as TeamRole,
        count: stats.analysts,
        description: "Analyze data, create reports and insights",
        permissions: "View data, reports, AI, export",
      },
      {
        role: "VIEWER" as TeamRole,
        count: stats.viewers,
        description: "View dashboards and reports",
        permissions: "View data and reports",
      },
    ],
    [stats],
  );

  const invite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setWorkingId("invite");
    try {
      await inviteMember(email, inviteRole);
      toast.success(`Invitation sent to ${email}`);
      setInviteEmail("");
      setInviteOpen(false);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const changeRole = async (member: TeamMember, nextRole: TeamRole) => {
    if (!canManage || nextRole === member.role) return;
    setWorkingId(member.id);
    try {
      await updateMemberRole(member.id, nextRole);
      toast.success(`${member.name}'s role was updated.`);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const toggleStatus = async (member: TeamMember) => {
    if (!canManage) return;
    setWorkingId(member.id);
    try {
      await updateMemberStatus(member.id, !member.isActive);
      toast.success(
        member.isActive ? "Member deactivated." : "Member activated.",
      );
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const deleteMember = async (member: TeamMember) => {
    if (!canManage) return;
    setMenuId(null);
    if (
      !window.confirm(
        `Remove ${member.name || member.email} from this workspace?`,
      )
    )
      return;
    setWorkingId(member.id);
    try {
      await removeMember(member.id);
      toast.success("Member removed.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const resend = async (inviteItem: TeamInvite) => {
    setWorkingId(inviteItem.id);
    try {
      await resendInvite(inviteItem.id);
      toast.success("Invitation resent.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const cancel = async (inviteItem: TeamInvite) => {
    setWorkingId(inviteItem.id);
    try {
      await cancelInvite(inviteItem.id);
      toast.success("Invitation cancelled.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const userName = user?.name ?? "Analyst";
  const workspaceName =
    (user as { workspace?: { name?: string } } | null)?.workspace?.name ??
    "Current Workspace";
  const userAvatar = user?.avatarUrl ?? null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.titleRow}>
            <h1>Team / Users</h1>
            <Users size={21} />
          </div>
          <p>Manage workspace members, roles, permissions, and access</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.dateButton} type="button">
            <span>
              {format(new Date(), "MMM d")} –{" "}
              {format(new Date(), "MMM d, yyyy")}
            </span>
            <CalendarDays size={16} />
          </button>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <sup>3</sup>
          </button>
          <button className={styles.iconButton} type="button" aria-label="Help">
            <CircleHelp size={20} />
          </button>
          <div className={styles.profile}>
            {userAvatar ? (
              <img src={userAvatar} alt="" />
            ) : (
              <span>{initials(userName)}</span>
            )}
            <div>
              <strong>{userName}</strong>
              <small>{roleLabel(currentRole)}</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </header>

      <section className={styles.metrics}>
        <MetricCard
          icon={<Users size={20} />}
          label="Total Members"
          value={stats.total.toLocaleString("en-IN")}
          change={`${stats.newMembers} new this week`}
          tone="purple"
        />
        <MetricCard
          icon={<ShieldCheck size={20} />}
          label="Active Members"
          value={stats.active.toLocaleString("en-IN")}
          change={
            stats.total
              ? `${Math.round((stats.active / stats.total) * 100)}% of members active`
              : "No members"
          }
          tone="green"
        />
        <MetricCard
          icon={<UserPlus size={20} />}
          label="Administrators"
          value={stats.admins.toLocaleString("en-IN")}
          change="Workspace administrators"
          tone="orange"
        />
        <MetricCard
          icon={<UserCheck size={20} />}
          label="Analysts"
          value={stats.analysts.toLocaleString("en-IN")}
          change="Analysis and reporting access"
          tone="blue"
        />
        <MetricCard
          icon={<Eye size={20} />}
          label="Viewers"
          value={stats.viewers.toLocaleString("en-IN")}
          change="Read-only access"
          tone="indigo"
        />
        <MetricCard
          icon={<Mail size={20} />}
          label="Pending Invites"
          value={invites.length.toLocaleString("en-IN")}
          change="Waiting for acceptance"
          tone="teal"
        />
      </section>

      <div className={styles.mainGrid}>
        <section className={styles.contentColumn}>
          <article className={styles.card}>
            <header className={styles.tableHeader}>
              <div>
                <h2>
                  All Team Members <span>({stats.total})</span>
                </h2>
              </div>
              <div className={styles.tableTools}>
                <label className={styles.searchBox}>
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search members..."
                  />
                </label>
                <select
                  className={styles.filterSelect}
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value as "ALL" | TeamRole)
                  }
                >
                  <option value="ALL">All roles</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as "ALL" | "ACTIVE" | "INACTIVE",
                    )
                  }
                >
                  <option value="ALL">All status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                {canManage && (
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => setInviteOpen(true)}
                  >
                    <UserPlus size={16} /> Invite Member
                  </button>
                )}
              </div>
            </header>

            {loading ? (
              <div className={styles.loadingState}>
                <div />
                <div />
                <div />
                <div />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={28} />
                <strong>No team members found</strong>
                <span>Try a different search or filter.</span>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Workspace Access</th>
                      <th>Last Active</th>
                      <th>Status</th>
                      <th>Joined On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member, index) => (
                      <tr key={`${member.id || member.email}-${index}`}>
                        <td>
                          <div className={styles.memberCell}>
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" />
                            ) : (
                              <span>{initials(member.name, member.email)}</span>
                            )}
                            <div>
                              <strong>{member.name || member.email}</strong>
                              <small>{member.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <RoleBadge role={member.role} />
                        </td>
                        <td>{member.department || "—"}</td>
                        <td>
                          {member.role === "ADMIN"
                            ? "All Workspaces"
                            : workspaceName}
                        </td>
                        <td>
                          <div className={styles.lastActive}>
                            <i
                              className={
                                member.isActive
                                  ? styles.onlineDot
                                  : styles.offlineDot
                              }
                            />
                            {relativeLastActive(member.lastLoginAt)}
                            <small>
                              {member.lastLoginAt
                                ? "Online history"
                                : "No login yet"}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${member.isActive ? styles.active : styles.inactive}`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{safeDate(member.createdAt)}</td>
                        <td>
                          <div className={styles.actionsCell}>
                            {canManage ? (
                              <select
                                disabled={workingId === member.id}
                                value={member.role}
                                onChange={(event) =>
                                  void changeRole(
                                    member,
                                    event.target.value as TeamRole,
                                  )
                                }
                                aria-label={`Change role for ${member.name}`}
                              >
                                <option value="ADMIN">Administrator</option>
                                <option value="ANALYST">Analyst</option>
                                <option value="VIEWER">Viewer</option>
                              </select>
                            ) : (
                              <button
                                className={styles.actionButton}
                                type="button"
                                onClick={() =>
                                  setMenuId(
                                    menuId === member.id ? null : member.id,
                                  )
                                }
                                aria-label={`View ${member.name}`}
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            {canManage && (
                              <button
                                className={styles.actionButton}
                                type="button"
                                disabled={workingId === member.id}
                                onClick={() => void toggleStatus(member)}
                                title={
                                  member.isActive ? "Deactivate" : "Activate"
                                }
                              >
                                {member.isActive ? (
                                  <UserX size={16} />
                                ) : (
                                  <UserCheck size={16} />
                                )}
                              </button>
                            )}
                            <button
                              className={styles.actionButton}
                              type="button"
                              onClick={() =>
                                setMenuId(
                                  menuId === member.id ? null : member.id,
                                )
                              }
                              aria-label="More actions"
                            >
                              <MoreHorizontal size={17} />
                            </button>
                            {menuId === member.id && (
                              <div className={styles.menu}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuId(null);
                                    toast.info(
                                      `${member.name} — ${roleLabel(member.role)}, ${member.isActive ? "active" : "inactive"}`,
                                    );
                                  }}
                                >
                                  <Eye size={14} /> View member
                                </button>
                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => void deleteMember(member)}
                                  >
                                    <X size={14} /> Remove member
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <footer className={styles.tableFooter}>
              <span>
                Showing {filteredMembers.length} of {stats.total} members
              </span>
              <span className={styles.readOnlyNote}>
                {canManage
                  ? "Administrator controls enabled"
                  : "Analyst view · member changes require an Administrator"}
              </span>
            </footer>
          </article>

          <div className={styles.bottomGrid}>
            <article className={styles.card}>
              <header>
                <div>
                  <h2>Roles &amp; Permissions</h2>
                  <p>Access levels available in this workspace</p>
                </div>
              </header>
              <div className={styles.rolesTable}>
                {roleRows.map((row, index) => (
                  <div className={styles.roleRow} key={`${row.role}-${index}`}>
                    <div
                      className={`${styles.roleSquare} ${styles[ROLE_COLORS[row.role]]}`}
                    >
                      {row.role === "ADMIN" ? (
                        <ShieldCheck size={17} />
                      ) : row.role === "ANALYST" ? (
                        <UserCheck size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </div>
                    <div>
                      <strong>{roleLabel(row.role)}</strong>
                      <span>{row.count} members</span>
                    </div>
                    <p>{row.description}</p>
                    <small>{row.permissions}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.card}>
              <header>
                <div>
                  <h2>Team Activity</h2>
                  <p>Workspace member activity from available member data</p>
                </div>
                <Activity size={18} />
              </header>
              <div className={styles.activitySummary}>
                <div>
                  <strong>{stats.active}</strong>
                  <span>Active members</span>
                </div>
                <div>
                  <strong>{stats.newMembers}</strong>
                  <span>New this week</span>
                </div>
                <div>
                  <strong>{invites.length}</strong>
                  <span>Pending invites</span>
                </div>
              </div>
              <div className={styles.activityBars}>
                {roleRows.map((row, index) => (
                  <div
                    className={styles.barRow}
                    key={`${row.role}-bar-${index}`}
                  >
                    <span>{roleLabel(row.role)}</span>
                    <div>
                      <i
                        style={{
                          width: `${stats.total ? Math.max(4, (row.count / stats.total) * 100) : 4}%`,
                        }}
                      />
                    </div>
                    <b>{row.count}</b>
                  </div>
                ))}
              </div>
              <p className={styles.dataNote}>
                Reports, feedback-reviewed, AI-query, and historical role-change
                totals require an aggregate activity endpoint. This page does
                not fabricate those values.
              </p>
            </article>
          </div>
        </section>

        <aside className={styles.rail}>
          <article className={styles.card}>
            <header>
              <h2>Team Summary</h2>
              <button type="button" onClick={() => void load()}>
                Refresh
              </button>
            </header>
            <div className={styles.summaryList}>
              <div>
                <span>New Members</span>
                <b>{stats.newMembers}</b>
              </div>
              <div>
                <span>Removed Members</span>
                <b>—</b>
              </div>
              <div>
                <span>Role Changes</span>
                <b>—</b>
              </div>
              <div>
                <span>Permission Updates</span>
                <b>—</b>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <header>
              <h2>Members by Role</h2>
              <span>This Workspace</span>
            </header>
            <div
              className={styles.roleDonut}
              style={{
                background: `conic-gradient(#5b2cf0 0 ${stats.total ? (stats.admins / stats.total) * 360 : 0}deg, #2563eb ${stats.total ? (stats.admins / stats.total) * 360 : 0}deg ${stats.total ? ((stats.admins + stats.analysts) / stats.total) * 360 : 0}deg, #8b5cf6 ${stats.total ? ((stats.admins + stats.analysts) / stats.total) * 360 : 0}deg 360deg)`,
              }}
            >
              <div>
                <strong>{stats.total}</strong>
                <span>Total</span>
              </div>
            </div>
            <div className={styles.legend}>
              {roleRows.map((row, index) => (
                <div key={`${row.role}-legend-${index}`}>
                  <i className={styles[ROLE_COLORS[row.role]]} />
                  <span>{roleLabel(row.role)}</span>
                  <b>
                    {row.count} (
                    {stats.total
                      ? Math.round((row.count / stats.total) * 100)
                      : 0}
                    %)
                  </b>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.card}>
            <header>
              <h2>Activity Overview</h2>
              <span>This Week</span>
            </header>
            <div className={styles.overviewRows}>
              <div>
                <span>Active Members</span>
                <b>{stats.active}</b>
              </div>
              <div>
                <span>New Members</span>
                <b>{stats.newMembers}</b>
              </div>
              <div>
                <span>Pending Invites</span>
                <b>{invites.length}</b>
              </div>
              <div>
                <span>Inactive Members</span>
                <b>{stats.total - stats.active}</b>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <header>
              <h2>Pending Invitations</h2>
              <span>{invites.length} total</span>
            </header>
            {invites.length === 0 ? (
              <div className={styles.miniEmpty}>
                <Mail size={20} />
                <span>No pending invitations</span>
              </div>
            ) : (
              <div className={styles.inviteList}>
                {invites.slice(0, 5).map((item, index) => (
                  <div
                    className={styles.inviteItem}
                    key={`${item.id || item.email}-${index}`}
                  >
                    <span className={styles.inviteIcon}>
                      <Mail size={15} />
                    </span>
                    <div>
                      <strong>{item.email}</strong>
                      <small>
                        {roleLabel(item.role)} · expires{" "}
                        {safeDate(item.expiresAt)}
                      </small>
                    </div>
                    <div className={styles.inviteActions}>
                      <button
                        type="button"
                        disabled={!canManage || workingId === item.id}
                        onClick={() => void resend(item)}
                      >
                        Resend
                      </button>
                      {canManage && (
                        <button
                          type="button"
                          disabled={workingId === item.id}
                          onClick={() => void cancel(item)}
                          aria-label="Cancel invitation"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {invites.length > 5 && (
              <button className={styles.outlineButton} type="button">
                View all invitations
              </button>
            )}
          </article>
        </aside>
      </div>

      {inviteOpen && canManage && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setInviteOpen(false);
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
          >
            <header>
              <div>
                <h2 id="invite-title">Invite Team Member</h2>
                <p>Send a workspace invitation.</p>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </header>
            <label>
              Email address
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="teammate@company.com"
                autoFocus
              />
            </label>
            <label>
              Role
              <select
                value={inviteRole}
                onChange={(event) =>
                  setInviteRole(event.target.value as TeamRole)
                }
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
              </select>
            </label>
            <footer>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={!inviteEmail.trim() || workingId === "invite"}
                onClick={() => void invite()}
              >
                {workingId === "invite" ? "Sending..." : "Send Invitation"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
