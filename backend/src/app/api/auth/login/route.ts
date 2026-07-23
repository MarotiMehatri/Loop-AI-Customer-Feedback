import { Router } from "express";
import { authController } from "../../../../controllers/auth.controller.js";
import { rateLimit } from "../../../../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }),
  authController.login,
);

export default router;
