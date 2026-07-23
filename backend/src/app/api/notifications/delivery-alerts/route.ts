import { Router } from "express";
import { notificationController } from "../../../../controllers/notification.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, notificationController.getDeliveryAlerts);

export default router;
