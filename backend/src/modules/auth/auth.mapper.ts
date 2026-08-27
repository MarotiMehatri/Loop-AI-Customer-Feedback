// import type { AuthenticatedUser, JwtPayload } from "./auth.types.js";

// export function toAuthResponse(
//   message: string,
//   accessToken: string,
//   user: AuthenticatedUser,
// ) {
//   return {
//     message,
//     accessToken,
//     user: mapPublicUser(user),
//   };
// }

// export function mapPublicUser(user: AuthenticatedUser) {
//   return {
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     avatarUrl: user.avatarUrl,
//     isActive: user.isActive,
//     workspaceId: user.workspaceId,
//     lastLoginAt: user.lastLoginAt,
//     createdAt: user.createdAt,
//     updatedAt: user.updatedAt,
//   };
// }

// export function mapJwtPayloadToPublicUser(
//   payload: JwtPayload,
// ): Omit<JwtPayload, "iat" | "exp"> {
//   return {
//     userId: payload.userId,
//     email: payload.email,
//     role: payload.role,
//     workspaceId: payload.workspaceId,
//   };
// }

import type { Role } from "../../generated/prisma/client.js";

export interface MapperUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  isActive: boolean;
  workspaceId: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const mapPublicUser = (user: MapperUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  isActive: user.isActive,
  workspaceId: user.workspaceId,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});