import { Router } from "express";

import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/database-check",

  asyncHandler(async (_req, res) => {
    const workspaceCount = await prisma.workspace.count();

    const userCount = await prisma.user.count();

    res.status(200).json({
      success: true,
      message: "PostgreSQL and Prisma are connected successfully",

      data: {
        workspaces: workspaceCount,
        users: userCount,
      },
    });
  }),
);

export default router;
