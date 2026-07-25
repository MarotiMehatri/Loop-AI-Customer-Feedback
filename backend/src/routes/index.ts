import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";
import { feedbackImportRouter } from "../modules/feedback-import/index.js";
import { feedbackRouter } from "../modules/feedback/feedback.routes.js";
import { feedbackInboxRouter } from "../modules/feedback-inbox/feedbackInbox.routes.js";
import { analyticsRouter } from "../modules/analytics/analytics.routes.js";
import { askLoopRouter } from "../modules/ask-loop/askLoop.routes.js";
import reportRouter from "../modules/reports/report.routes.js";
import { authenticate } from "../middleware/authenticate.middleware.js";
import memberRouter from "../modules/members/member.routes.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "LOOP API is running",
    version: "1.0.0",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/feedback", feedbackRouter);
apiRouter.use("/feedback-import", feedbackImportRouter);
apiRouter.use("/feedback-inbox", feedbackInboxRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/ask-loop", askLoopRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/members", authenticate, memberRouter);
