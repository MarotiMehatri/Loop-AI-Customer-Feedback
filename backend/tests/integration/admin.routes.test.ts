import { beforeEach, describe, expect, it, vi } from "vitest";

import jwt from "jsonwebtoken";

import request from "supertest";

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

import { app } from "../../src/app.js";

import { env } from "../../src/config/env.js";

import * as workspaceModule from "../../src/modules/workspace/workspace.repository.js";

const workspaceRepository = workspaceModule.workspaceRepository;

const workspaceRecord = {
  id: "workspace-1",
  name: "Acme Inc",
  slug: "acme-inc",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

function makeToken(role: "ADMIN" | "ANALYST" | "VIEWER"): string {
  return jwt.sign(
    {
      userId: "user-1",
      email: "user@example.com",
      role,
      workspaceId: "workspace-1",
    },
    env.JWT_SECRET,
    { issuer: "loop-backend", audience: "loop-frontend" },
  );
}

describe("admin workspace routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DELETE /api/v1/workspace", () => {
    it("denies a viewer with a 403", async () => {
      const response = await request(app)
        .delete("/api/v1/workspace")
        .set("Authorization", `Bearer ${makeToken("VIEWER")}`)
        .send({ confirmation: "DELETE WORKSPACE" });

      expect(response.status).toBe(403);
    });

    it("denies an analyst with a 403", async () => {
      const response = await request(app)
        .delete("/api/v1/workspace")
        .set("Authorization", `Bearer ${makeToken("ANALYST")}`)
        .send({ confirmation: "DELETE WORKSPACE" });

      expect(response.status).toBe(403);
    });

    it("rejects a wrong confirmation with a 400", async () => {
      const response = await request(app)
        .delete("/api/v1/workspace")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
        .send({ confirmation: "nope" });

      expect(response.status).toBe(400);
    });

    it("deletes the workspace as an admin", async () => {
      vi.mocked(workspaceRepository.findById).mockResolvedValue(
        workspaceRecord as never,
      );
      vi.mocked(workspaceRepository.deleteById).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .delete("/api/v1/workspace")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
        .send({ confirmation: "DELETE WORKSPACE" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Workspace deleted successfully");
      expect(workspaceRepository.deleteById).toHaveBeenCalledWith(
        "workspace-1",
      );
    });
  });

  describe("POST /api/v1/workspace", () => {
    it("denies a viewer with a 403", async () => {
      const response = await request(app)
        .post("/api/v1/workspace")
        .set("Authorization", `Bearer ${makeToken("VIEWER")}`)
        .send({ name: "New Workspace" });

      expect(response.status).toBe(403);
    });

    it("creates a workspace as an admin", async () => {
      vi.mocked(workspaceRepository.findBySlug).mockResolvedValue(null);
      vi.mocked(workspaceRepository.create).mockResolvedValue(
        workspaceRecord as never,
      );

      const response = await request(app)
        .post("/api/v1/workspace")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
        .send({ name: "Acme Inc" });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Acme Inc");
    });

    it("returns 400 for an invalid name", async () => {
      const response = await request(app)
        .post("/api/v1/workspace")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
        .send({ name: "A" });

      expect(response.status).toBe(400);
    });
  });
});
