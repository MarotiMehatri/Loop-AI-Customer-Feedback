import { beforeEach, describe, expect, it, vi } from "vitest";

import jwt from "jsonwebtoken";

import request from "supertest";

vi.mock("../../src/modules/analytics/analytics.service.js", () => ({
  analyticsService: {
    getDashboard: vi.fn(),
    getOverview: vi.fn(),
    getTrend: vi.fn(),
    getSentimentDistribution: vi.fn(),
    getSourceDistribution: vi.fn(),
    getCategoryDistribution: vi.fn(),
    getTopThemes: vi.fn(),
    getHourlyDistribution: vi.fn(),
    exportAnalytics: vi.fn(),
  },
}));

import { app } from "../../src/app.js";

import { env } from "../../src/config/env.js";

import { analyticsService } from "../../src/modules/analytics/analytics.service.js";

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

describe("analytics routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without a token", async () => {
    const response = await request(app).get("/api/v1/analytics/overview");

    expect(response.status).toBe(401);
  });

  describe("GET /api/v1/analytics/overview", () => {
    it("returns the analytics overview for an authenticated user", async () => {
      vi.mocked(analyticsService.getOverview).mockResolvedValue({
        totalFeedbacks: 42,
      } as never);

      const response = await request(app)
        .get("/api/v1/analytics/overview")
        .set("Authorization", `Bearer ${makeToken("VIEWER")}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ totalFeedbacks: 42 });
    });

    it("passes the workspace id from the token", async () => {
      vi.mocked(analyticsService.getOverview).mockResolvedValue({} as never);

      await request(app)
        .get("/api/v1/analytics/overview")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(vi.mocked(analyticsService.getOverview)).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: "workspace-1" }),
      );
    });
  });

  describe("GET /api/v1/analytics/ (dashboard)", () => {
    it("returns the dashboard data", async () => {
      vi.mocked(analyticsService.getDashboard).mockResolvedValue({
        kpis: { total: 10 },
      } as never);

      const response = await request(app)
        .get("/api/v1/analytics/")
        .set("Authorization", `Bearer ${makeToken("ANALYST")}`);

      expect(response.status).toBe(200);
      expect(response.body.data.kpis).toEqual({ total: 10 });
    });
  });

  describe("GET /api/v1/analytics/export", () => {
    it("returns JSON rows by default", async () => {
      vi.mocked(analyticsService.exportAnalytics).mockResolvedValue([
        { total: 1 },
      ] as never);

      const response = await request(app)
        .get("/api/v1/analytics/export")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([{ total: 1 }]);
    });

    it("streams CSV when format=csv", async () => {
      vi.mocked(analyticsService.exportAnalytics).mockResolvedValue([
        { total: 1, label: "a" },
      ] as never);

      const response = await request(app)
        .get("/api/v1/analytics/export")
        .query({ format: "csv" })
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("text/csv");
      expect(response.text).toBe('total,label\n"1","a"');
    });
  });
});
