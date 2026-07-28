import { Router } from 'express';

import { authRouter } from '../modules/auth/auth.routes.js';
import { feedbackImportRouter } from '../modules/feedback-import/index.js';
import { feedbackRouter } from '../modules/feedback/feedback.routes.js';
import { feedbackInboxRouter } from '../modules/feedback-inbox/feedbackInbox.routes.js';
import { analyticsRouter } from '../modules/analytics/analytics.routes.js';
import { askLoopRouter } from '../modules/ask-loop/askLoop.routes.js';
import reportRouter from '../modules/reports/report.routes.js';
import { authenticate } from '../middleware/authenticate.middleware.js';
import memberRouter from '../modules/members/member.routes.js';
import profileRouter from '../modules/profile/profile.routes.js';
import activityRouter from '../modules/activity/activity.routes.js';

import settingsRouter from '../modules/settings/settings.routes.js';
import themeRouter from '../modules/themes/theme.routes.js';
import dashboardRouter from '../modules/dashboard/dashboard.routes.js';
import workspaceRouter from '../modules/workspace/workspace.routes.js';
import { notificationRoutes } from '../modules/notifications/notification.routes.js';

import { healthRouter } from '../modules/health/index.js';
import { savedViewsRouter } from '../modules/saved-views/index.js';
import { trendsRouter } from '../modules/trends/index.js';
import { aiClassificationRouter } from '../modules/ai-classification/index.js';
import { dataSourcesRouter } from '../modules/data-sources/index.js';
import { exportsRouter } from '../modules/exports/index.js';

export const apiRouter = Router();

apiRouter.get('/', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'LOOP API is running',
    version: '1.0.0',
  });
});

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/feedback', feedbackRouter);
apiRouter.use('/feedback-import', feedbackImportRouter);
apiRouter.use('/feedback-inbox', feedbackInboxRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/ask-loop', askLoopRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/members', authenticate, memberRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/activity', activityRouter);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/theme', themeRouter);
apiRouter.use('/saved-views', savedViewsRouter);
apiRouter.use('/trends', trendsRouter);
apiRouter.use('/ai-classification', aiClassificationRouter);
apiRouter.use('/data-sources', dataSourcesRouter);
apiRouter.use('/exports', exportsRouter);
apiRouter.use('workspace', workspaceRouter);
