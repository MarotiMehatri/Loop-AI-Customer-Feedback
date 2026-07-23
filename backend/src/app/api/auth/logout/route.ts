import { Router } from "express";
import { authController } from "../../../../controllers/auth.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, authController.logout);

export default router;
