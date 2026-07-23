import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../lib/password.js";
import { generateToken } from "../lib/jwt.js";
import { ApiError } from "../utils/apiError.js";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  const valid = await comparePassword(password, user.passwordHash);

  if (!valid) {
    throw new ApiError(401, "Invalid email or password");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = generateToken({ userId: user.id, workspaceId: user.workspaceId, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      workspaceId: user.workspaceId,
    },
    token,
  };
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "ANALYST" | "VIEWER",
  workspaceId: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      workspaceId,
    },
  });

  const token = generateToken({ userId: user.id, workspaceId: user.workspaceId, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      workspaceId: user.workspaceId,
    },
    token,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { workspace: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    workspace: {
      id: user.workspace.id,
      name: user.workspace.name,
      slug: user.workspace.slug,
    },
  };
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const valid = await comparePassword(oldPassword, user.passwordHash);

  if (!valid) {
    throw new ApiError(401, "Current password is incorrect");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
