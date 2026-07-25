import * as askLoopService from "../services/ask-loop.service.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { getWorkspaceId } from "../utils/requestContext.js";

export const askLoopController = {
  ask: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { question, context, themeId } = req.body;
    const result = await askLoopService.askQuestion(workspaceId, question, {
      context,
      themeId,
    });
    success(res, "Question answered", result);
  }),
};
