import { describe, expect, it } from "vitest";

import { Role } from "../../src/generated/prisma/client.js";

import { PERMISSION } from "../../src/permissions/permission.types.js";

import {
  canManageMembers,
  getPermissionsForRole,
} from "../../src/permissions/permission.service.js";

import {
  assertPermission,
  hasPermission,
} from "../../src/permissions/rolePermissions.js";

import { ApiError } from "../../src/utils/apiError.js";

describe("permission.service", () => {
  describe("getPermissionsForRole", () => {
    it("grants the admin all management permissions", () => {
      const permissions = getPermissionsForRole(Role.ADMIN);

      expect(permissions.canManageWorkspace).toBe(true);
      expect(permissions.canManageMembers).toBe(true);
      expect(permissions.canManageSettings).toBe(true);
      expect(permissions.canManageFeedback).toBe(true);
      expect(permissions.canViewAnalytics).toBe(true);
      expect(permissions.canGenerateReports).toBe(true);
      expect(permissions.canUseAskLoop).toBe(true);
      expect(permissions.canExportData).toBe(true);
    });

    it("grants the analyst feedback and analytics access only", () => {
      const permissions = getPermissionsForRole(Role.ANALYST);

      expect(permissions.canManageFeedback).toBe(true);
      expect(permissions.canViewAnalytics).toBe(true);
      expect(permissions.canGenerateReports).toBe(true);
      expect(permissions.canExportData).toBe(true);
      expect(permissions.canManageWorkspace).toBe(false);
      expect(permissions.canManageMembers).toBe(false);
      expect(permissions.canManageSettings).toBe(false);
    });

    it("grants the viewer read-only access", () => {
      const permissions = getPermissionsForRole(Role.VIEWER);

      expect(permissions.canViewAnalytics).toBe(true);
      expect(permissions.canUseAskLoop).toBe(true);
      expect(permissions.canManageFeedback).toBe(false);
      expect(permissions.canGenerateReports).toBe(false);
      expect(permissions.canExportData).toBe(false);
      expect(permissions.canManageWorkspace).toBe(false);
    });
  });

  describe("canManageMembers", () => {
    it("returns true for admins", () => {
      expect(canManageMembers(Role.ADMIN)).toBe(true);
    });

    it("returns false for analysts and viewers", () => {
      expect(canManageMembers(Role.ANALYST)).toBe(false);
      expect(canManageMembers(Role.VIEWER)).toBe(false);
    });
  });

  describe("hasPermission", () => {
    it("returns false when no role is provided", () => {
      expect(hasPermission(undefined, PERMISSION.WORKSPACE_READ)).toBe(false);
    });

    it("allows admins to delete a workspace", () => {
      expect(hasPermission(Role.ADMIN, PERMISSION.WORKSPACE_DELETE)).toBe(true);
    });

    it("denies viewers destructive workspace permissions", () => {
      expect(hasPermission(Role.VIEWER, PERMISSION.WORKSPACE_DELETE)).toBe(
        false,
      );
      expect(hasPermission(Role.VIEWER, PERMISSION.WORKSPACE_UPDATE)).toBe(
        false,
      );
    });

    it("allows viewers to read the workspace", () => {
      expect(hasPermission(Role.VIEWER, PERMISSION.WORKSPACE_READ)).toBe(true);
    });
  });

  describe("assertPermission", () => {
    it("does not throw when the role has the permission", () => {
      expect(() =>
        assertPermission(Role.ADMIN, PERMISSION.WORKSPACE_DELETE),
      ).not.toThrow();
    });

    it("throws a 403 ApiError when the role lacks the permission", () => {
      expect(() =>
        assertPermission(Role.VIEWER, PERMISSION.WORKSPACE_DELETE),
      ).toThrow(ApiError);

      try {
        assertPermission(Role.VIEWER, PERMISSION.WORKSPACE_DELETE);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(403);
      }
    });
  });
});
