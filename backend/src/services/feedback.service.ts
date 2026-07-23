import * as feedbackRepo from "../repositories/feedback.repository.js";
import { ApiError } from "../utils/apiError.js";

export async function listFeedback(ws: string, query: Record<string, unknown>) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  return feedbackRepo.findMany(ws, {
    page,
    limit,
    status: query.status as string,
    sentiment: query.sentiment as string,
    channel: query.channel as string,
    themeId: query.themeId as string,
    search: query.search as string,
  });
}

export async function getFeedback(id: string, ws: string) {
  const feedback = await feedbackRepo.findById(id, ws);
  if (!feedback) throw new ApiError(404, "Feedback not found");
  return feedback;
}

export async function createFeedback(ws: string, data: Record<string, unknown>) {
  return feedbackRepo.create({ workspaceId: ws, ...data } as Parameters<typeof feedbackRepo.create>[0]);
}

export async function updateFeedback(id: string, ws: string, data: Record<string, unknown>) {
  const existing = await feedbackRepo.findById(id, ws);
  if (!existing) throw new ApiError(404, "Feedback not found");
  await feedbackRepo.update(id, ws, data);
  return feedbackRepo.findById(id, ws);
}

export async function changeStatus(id: string, ws: string, status: string) {
  const existing = await feedbackRepo.findById(id, ws);
  if (!existing) throw new ApiError(404, "Feedback not found");
  await feedbackRepo.updateStatus(id, ws, status);
}

export async function deleteFeedback(id: string, ws: string) {
  const existing = await feedbackRepo.findById(id, ws);
  if (!existing) throw new ApiError(404, "Feedback not found");
  await feedbackRepo.deleteFeedback(id, ws);
}

export async function importFeedback(ws: string, items: Array<Record<string, unknown>>) {
  const count = await feedbackRepo.bulkCreate(ws, items);
  return { imported: count, total: items.length };
}

export async function getFeedbackStats(ws: string) {
  return feedbackRepo.getStats(ws);
}

export async function searchFeedback(ws: string, query: string, page = 1, limit = 20) {
  return feedbackRepo.searchByContent(ws, query, page, limit);
}
