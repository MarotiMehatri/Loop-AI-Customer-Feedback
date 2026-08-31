export type TeamRole = "ADMIN" | "ANALYST" | "VIEWER";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  isActive: boolean;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  location?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED" | string;
  expiresAt: string;
  createdAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface TeamResponse<T> {
  data: Paginated<T>;
}
