import { apiClient } from "../../../lib/api/api-client";
import type { Paginated, TeamInvite, TeamMember, TeamResponse, TeamRole } from "../team.types";

function unwrap<T>(payload: unknown): Paginated<T> {
  const root = payload as { data?: unknown } | undefined;
  const value = (root?.data ?? payload) as Partial<Paginated<T>> | undefined;
  return {
    items: Array.isArray(value?.items) ? value.items : [],
    pagination: {
      page: Number(value?.pagination?.page ?? 1),
      limit: Number(value?.pagination?.limit ?? 100),
      total: Number(value?.pagination?.total ?? 0),
      totalPages: Number(value?.pagination?.totalPages ?? 1),
    },
  };
}

export async function getTeamMembers(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get<TeamResponse<TeamMember>>("/members", {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 100 },
  });
  return unwrap<TeamMember>(response.data);
}

export async function getTeamInvites(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get<TeamResponse<TeamInvite>>("/members/invites", {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 100 },
  });
  return unwrap<TeamInvite>(response.data);
}

export async function inviteMember(email: string, role: TeamRole) {
  const response = await apiClient.post("/members/invite", { email, role });
  return response.data;
}

export async function updateMemberRole(memberId: string, role: TeamRole) {
  const response = await apiClient.patch(`/members/${memberId}/role`, { role });
  return response.data;
}

export async function updateMemberStatus(memberId: string, isActive: boolean) {
  const response = await apiClient.patch(`/members/${memberId}/status`, { isActive });
  return response.data;
}

export async function removeMember(memberId: string) {
  const response = await apiClient.delete(`/members/${memberId}`);
  return response.data;
}

export async function resendInvite(inviteId: string) {
  const response = await apiClient.post(`/members/invites/${inviteId}/resend`);
  return response.data;
}

export async function cancelInvite(inviteId: string) {
  const response = await apiClient.delete(`/members/invites/${inviteId}`);
  return response.data;
}
