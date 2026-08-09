import { beforeEach, describe, expect, it, vi } from "vitest";

import jwt from "jsonwebtoken";

import request from "supertest";

vi.mock("../../src/modules/feedback/feedback.repository.js", () => ({
  createFeedbackRecord: vi.fn(),
  findFeedbackById: vi.fn(),
  findFeedbackList: vi.fn(),
  updateFeedbackRecord: vi.fn(),
  updateFeedbackStatusRecord: vi.fn(),
  deleteFeedbackRecord: vi.fn(),
}));

import { app } from "../../src/app.js";

import { env } from "../../src/config/env.js";

import * as feedbackRepository from "../../src/modules/feedback/feedback.repository.js";

const feedbackRecord = {
  id: "fb-1",
  source: "WEB",
  sentiment: "POSITIVE",
  status: "NEW",
  customerName: "Alice",
  customerEmail: "alice@example.com",
  content: "Great service",
  tags: ["shipping"],
  category: "service",
  isImportant: false,
  workspaceId: "workspace-1",
  createdById: "user-1",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  createdBy: {
    id: "user-1",
    name: "Admin",
    email: "admin@example.com",
    avatarUrl: null,
  },
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

describe("feedback routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without an authorization header", async () => {
    const response = await request(app).get("/api/v1/feedback");

    expect(response.status).toBe(401);
  });

  it("returns 401 with a malformed authorization header", async () => {
    const response = await request(app)
      .get("/api/v1/feedback")
      .set("Authorization", "not-a-bearer-token");

    expect(response.status).toBe(401);
  });

  describe("GET /api/v1/feedback", () => {
    it("returns the feedback list for an authenticated user", async () => {
      vi.mocked(feedbackRepository.findFeedbackList).mockResolvedValue({
        feedbacks: [feedbackRecord as never],
        totalItems: 1,
      });

      const response = await request(app)
        .get("/api/v1/feedback")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.feedbacks).toHaveLength(1);
      expect(response.body.data.pagination.totalItems).toBe(1);
    });

    it("rejects an invalid date range with a 400", async () => {
      const response = await request(app)
        .get("/api/v1/feedback")
        .query({
          createdFrom: "2024-02-01T00:00:00Z",
          createdTo: "2024-01-01T00:00:00Z",
        })
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/feedback", () => {
    it("creates feedback as an admin", async () => {
      vi.mocked(feedbackRepository.createFeedbackRecord).mockResolvedValue(
        feedbackRecord as never,
      );

      const response = await request(app)
        .post("/api/v1/feedback")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
        .send({
          source: "WEBSITE",
          sentiment: "POSITIVE",
          content: "Great service",
          customerName: "Alice",
          customerEmail: "alice@example.com",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.feedback.id).toBe("fb-1");
      expect(feedbackRepository.createFeedbackRecord).toHaveBeenCalledWith(
        expect.objectContaining({ workspaceId: "workspace-1" }),
      );
    });

    it("denies a viewer with a 403", async () => {
      const response = await request(app)
        .post("/api/v1/feedback")
        .set("Authorization", `Bearer ${makeToken("VIEWER")}`)
        .send({
          source: "WEB",
          sentiment: "POSITIVE",
          content: "Great service",
        });

      expect(response.status).toBe(403);
    });

    it("returns 400 for an invalid payload", async () => {
      const response = await request(app)
        .post("/api/v1/feedback")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`)
        .send({ source: "WEB" });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/feedback/:feedbackId", () => {
    it("returns a single feedback record", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(
        feedbackRecord as never,
      );

      const response = await request(app)
        .get("/api/v1/feedback/fb-1")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.body.data.feedback.content).toBe("Great service");
    });

    it("returns 404 when the feedback does not exist", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/feedback/fb-1")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/feedback/:feedbackId", () => {
    it("denies a viewer with a 403", async () => {
      const response = await request(app)
        .delete("/api/v1/feedback/fb-1")
        .set("Authorization", `Bearer ${makeToken("VIEWER")}`);

      expect(response.status).toBe(403);
    });

    it("deletes feedback as an admin", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(
        feedbackRecord as never,
      );
      vi.mocked(feedbackRepository.deleteFeedbackRecord).mockResolvedValue(
        feedbackRecord as never,
      );

      const response = await request(app)
        .delete("/api/v1/feedback/fb-1")
        .set("Authorization", `Bearer ${makeToken("ADMIN")}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Feedback deleted successfully");
    });
  });
});
