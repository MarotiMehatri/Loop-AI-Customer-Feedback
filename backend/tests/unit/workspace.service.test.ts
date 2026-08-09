import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Role } from "../../src/generated/prisma/client.js";

vi.mock("../../src/modules/workspace/workspace.repository.js", () => ({
  workspaceRepository: {
    findById: vi.fn(),
    findFullById: vi.fn(),
    findBySlug: vi.fn(),
    create: vi.fn(),
    updateName: vi.fn(),
    getSummary: vi.fn(),
    deleteById: vi.fn(),
  },
}));

vi.mock("../../src/modules/activity/activity.logger.js", () => ({
  activityLogger: { logSafe: vi.fn(), log: vi.fn() },
}));

vi.mock("../../src/modules/workspace/workspace-overview.service.js", () => ({
  workspaceOverviewService: { getOverview: vi.fn() },
}));

vi.mock("../../src/modules/workspace/workspace-health.service.js", () => ({
  workspaceHealthService: { getHealth: vi.fn() },
}));

vi.mock("../../src/modules/workspace/workspace-usage.service.js", () => ({
  workspaceUsageService: { getUsage: vi.fn() },
}));

vi.mock("../../src/modules/workspace/workspace-switch.service.js", () => ({
  workspaceSwitchService: {
    getAvailableWorkspaces: vi.fn(),
    switchToWorkspace: vi.fn(),
  },
}));

import * as activityModule from "../../src/modules/activity/activity.logger.js";

import { workspaceService } from "../../src/modules/workspace/workspace.service.js";

import * as workspaceModule from "../../src/modules/workspace/workspace.repository.js";

const workspaceRepository = workspaceModule.workspaceRepository;

const workspaceRecord = {
  id: "workspace-1",
  name: "Acme Inc",
  slug: "acme-inc",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const adminContext = {
  userId: "user-1",
  email: "admin@example.com",
  role: "ADMIN" as Role,
  workspaceId: "workspace-1",
};

const viewerContext = {
  userId: "user-2",
  email: "viewer@example.com",
  role: "VIEWER" as Role,
  workspaceId: "workspace-1",
};

describe("workspace.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get", () => {
    it("returns the mapped workspace for a viewer", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(
        workspaceRecord as never,
      );

      await expect(workspaceService.get(viewerContext)).resolves.toMatchObject({
        id: "workspace-1",
        name: "Acme Inc",
        slug: "acme-inc",
      });
    });

    it("throws a 404 when the workspace is not found", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(null);

      await expect(workspaceService.get(adminContext)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("getSummary", () => {
    it("returns the workspace summary", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(
        workspaceRecord as never,
      );
      vi.mocked(workspaceRepository.getSummary).mockResolvedValue({
        members: 3,
        activeMembers: 2,
        feedback: 10,
        themes: 5,
        reports: 1,
      });

      await expect(
        workspaceService.getSummary(adminContext),
      ).resolves.toEqual({
        members: 3,
        activeMembers: 2,
        feedback: 10,
        themes: 5,
        reports: 1,
      });
    });
  });

  describe("create", () => {
    it("denies a viewer with a 403", async () => {
      await expect(
        workspaceService.create(viewerContext, { name: "Acme Inc" }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("creates a workspace and logs the activity", async () => {
      vi.mocked(workspaceRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(workspaceRepository.create).mockResolvedValue(
        workspaceRecord as never,
      );

      const result = await workspaceService.create(adminContext, {
        name: "Acme Inc",
      });

      expect(workspaceRepository.create).toHaveBeenCalledWith(
        "Acme Inc",
        "acme-inc",
      );
      expect(activityModule.activityLogger.logSafe).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          workspaceId: "workspace-1",
          entityId: "workspace-1",
          metadata: { slug: "acme-inc" },
        }),
      );
      expect(result).toMatchObject({ name: "Acme Inc" });
    });

    it("appends a suffix when the slug already exists", async () => {
      vi.mocked(workspaceRepository.findBySlug).mockResolvedValue(
        workspaceRecord as never,
      );
      vi.mocked(workspaceRepository.create).mockResolvedValue(
        workspaceRecord as never,
      );

      await workspaceService.create(adminContext, { name: "Acme Inc" });

      const slug = vi.mocked(workspaceRepository.create).mock.calls[0]![1];
      expect(slug).toMatch(/^acme-inc-/);
    });
  });

  describe("update", () => {
    it("denies a viewer with a 403", async () => {
      await expect(
        workspaceService.update(viewerContext, { name: "New Name" }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("throws a 404 when the workspace is not found", async () => {
      vi.mocked(workspaceRepository.updateName).mockResolvedValue(null);

      await expect(
        workspaceService.update(adminContext, { name: "New Name" }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("normalizes the name and logs the activity", async () => {
      vi.mocked(workspaceRepository.updateName).mockResolvedValue(
        workspaceRecord as never,
      );

      const result = await workspaceService.update(adminContext, {
        name: "  Acme   Inc  ",
      });

      expect(workspaceRepository.updateName).toHaveBeenCalledWith(
        "workspace-1",
        "Acme Inc",
      );
      expect(activityModule.activityLogger.logSafe).toHaveBeenCalledWith(
        expect.objectContaining({ type: "WORKSPACE_UPDATED" }),
      );
      expect(result).toMatchObject({ name: "Acme Inc" });
    });
  });

  describe("remove", () => {
    it("denies a viewer with a 403", async () => {
      await expect(
        workspaceService.remove(viewerContext, { confirmation: "DELETE WORKSPACE" }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("rejects an invalid confirmation with a 400", async () => {
      await expect(
        workspaceService.remove(adminContext, { confirmation: "nope" }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("throws a 404 when the workspace does not exist", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(null);

      await expect(
        workspaceService.remove(adminContext, {
          confirmation: "DELETE WORKSPACE",
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws a 404 when nothing was deleted", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(
        workspaceRecord as never,
      );
      vi.mocked(workspaceRepository.deleteById).mockResolvedValue({ count: 0 });

      await expect(
        workspaceService.remove(adminContext, {
          confirmation: "DELETE WORKSPACE",
        }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deletes the workspace", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(
        workspaceRecord as never,
      );
      vi.mocked(workspaceRepository.deleteById).mockResolvedValue({ count: 1 });

      await expect(
        workspaceService.remove(adminContext, {
          confirmation: "DELETE WORKSPACE",
        }),
      ).resolves.toBeUndefined();

      expect(workspaceRepository.deleteById).toHaveBeenCalledWith(
        "workspace-1",
      );
    });
  });
});
