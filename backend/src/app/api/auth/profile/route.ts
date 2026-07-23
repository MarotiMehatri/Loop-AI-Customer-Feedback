import { Router } from "express";
import { authController } from "../../../../controllers/auth.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, authController.getProfile);

router.put("/", authenticate, authController.changePassword);

export default router;
