import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/modules/feedback/feedback.repository.js", () => ({
  createFeedbackRecord: vi.fn(),
  findFeedbackById: vi.fn(),
  findFeedbackList: vi.fn(),
  updateFeedbackRecord: vi.fn(),
  updateFeedbackStatusRecord: vi.fn(),
  deleteFeedbackRecord: vi.fn(),
}));

import * as feedbackRepository from "../../src/modules/feedback/feedback.repository.js";

import {
  createFeedback,
  deleteFeedback,
  getFeedback,
  getFeedbackList,
  updateFeedback,
  updateFeedbackStatus,
} from "../../src/modules/feedback/feedback.service.js";

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

const baseFilters = {
  page: 1,
  limit: 2,
  sortBy: "createdAt",
  sortOrder: "desc",
} as const;

describe("feedback.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFeedback", () => {
    it("normalizes content, email and tags before persisting", async () => {
      vi.mocked(feedbackRepository.createFeedbackRecord).mockResolvedValue(
        feedbackRecord as never,
      );

      const result = await createFeedback(
        {
          source: "WEB",
          sentiment: "POSITIVE",
          content: "  Great service  ",
          customerName: "  Alice  ",
          customerEmail: "  ALICE@EXAMPLE.COM  ",
          tags: ["shipping", "shipping", "", "  "],
          category: "  service  ",
        },
        "workspace-1",
        "user-1",
      );

      expect(feedbackRepository.createFeedbackRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Great service",
          customerEmail: "alice@example.com",
          customerName: "Alice",
          tags: ["shipping"],
          category: "service",
          workspaceId: "workspace-1",
          createdById: "user-1",
        }),
      );

      expect(result.customer).toEqual({
        name: "Alice",
        email: "alice@example.com",
      });
    });

    it("defaults missing tags to an empty array", async () => {
      vi.mocked(feedbackRepository.createFeedbackRecord).mockResolvedValue(
        feedbackRecord as never,
      );

      await createFeedback(
        {
          source: "WEB",
          sentiment: "NEUTRAL",
          content: "Okay",
        },
        "workspace-1",
        "user-1",
      );

      expect(feedbackRepository.createFeedbackRecord).toHaveBeenCalledWith(
        expect.objectContaining({ tags: [] }),
      );
    });
  });

  describe("getFeedback", () => {
    it("returns the mapped feedback when found", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(
        feedbackRecord as never,
      );

      await expect(
        getFeedback("fb-1", "workspace-1"),
      ).resolves.toMatchObject({ id: "fb-1", content: "Great service" });
    });

    it("throws a 404 when the feedback does not exist", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(null);

      await expect(
        getFeedback("fb-1", "workspace-1"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("getFeedbackList", () => {
    it("rejects an invalid date range with a 400", async () => {
      await expect(
        getFeedbackList("workspace-1", {
          ...baseFilters,
          createdFrom: new Date("2024-02-01"),
          createdTo: new Date("2024-01-01"),
        }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("computes pagination metadata for the first page", async () => {
      vi.mocked(feedbackRepository.findFeedbackList).mockResolvedValue({
        feedbacks: [feedbackRecord as never],
        totalItems: 5,
      });

      const result = await getFeedbackList("workspace-1", {
        ...baseFilters,
        page: 1,
        limit: 2,
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 2,
        totalItems: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it("computes pagination metadata for the last page", async () => {
      vi.mocked(feedbackRepository.findFeedbackList).mockResolvedValue({
        feedbacks: [feedbackRecord as never],
        totalItems: 5,
      });

      const result = await getFeedbackList("workspace-1", {
        ...baseFilters,
        page: 3,
        limit: 2,
      });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 2,
        totalItems: 5,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });

  describe("updateFeedback", () => {
    it("throws a 404 when the feedback does not exist", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(null);

      await expect(
        updateFeedback("fb-1", "workspace-1", { content: "Updated" }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("normalizes fields before updating", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(
        feedbackRecord as never,
      );
      vi.mocked(feedbackRepository.updateFeedbackRecord).mockResolvedValue(
        feedbackRecord as never,
      );

      await updateFeedback("fb-1", "workspace-1", {
        customerName: "  Bob  ",
        customerEmail: "  BOB@EXAMPLE.COM  ",
        tags: ["urgent", "urgent"],
      });

      expect(feedbackRepository.updateFeedbackRecord).toHaveBeenCalledWith(
        "fb-1",
        "workspace-1",
        expect.objectContaining({
          customerName: "Bob",
          customerEmail: "bob@example.com",
          tags: ["urgent"],
        }),
      );
    });
  });

  describe("updateFeedbackStatus", () => {
    it("throws a 404 when the feedback does not exist", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(null);

      await expect(
        updateFeedbackStatus("fb-1", "workspace-1", { status: "REVIEWED" }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("updates the status when the feedback exists", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(
        feedbackRecord as never,
      );
      vi.mocked(feedbackRepository.updateFeedbackStatusRecord).mockResolvedValue({
        ...feedbackRecord,
        status: "REVIEWED",
      } as never);

      const result = await updateFeedbackStatus("fb-1", "workspace-1", {
        status: "REVIEWED",
      });

      expect(
        feedbackRepository.updateFeedbackStatusRecord,
      ).toHaveBeenCalledWith("fb-1", "workspace-1", "REVIEWED");
      expect(result.status).toBe("REVIEWED");
    });
  });

  describe("deleteFeedback", () => {
    it("throws a 404 when the feedback does not exist", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(null);

      await expect(
        deleteFeedback("fb-1", "workspace-1"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("deletes the feedback when it exists", async () => {
      vi.mocked(feedbackRepository.findFeedbackById).mockResolvedValue(
        feedbackRecord as never,
      );
      vi.mocked(feedbackRepository.deleteFeedbackRecord).mockResolvedValue(
        feedbackRecord as never,
      );

      await deleteFeedback("fb-1", "workspace-1");

      expect(feedbackRepository.deleteFeedbackRecord).toHaveBeenCalledWith(
        "fb-1",
        "workspace-1",
      );
    });
  });
});
