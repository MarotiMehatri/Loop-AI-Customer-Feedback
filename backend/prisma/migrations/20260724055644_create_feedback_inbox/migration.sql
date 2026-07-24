/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,source,externalId]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "actionedAt" TIMESTAMP(3),
ADD COLUMN     "aiCategory" TEXT,
ADD COLUMN     "aiConfidence" DOUBLE PRECISION,
ADD COLUMN     "aiProcessedAt" TIMESTAMP(3),
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "customerAvatar" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "feedbackDate" TIMESTAMP(3),
ADD COLUMN     "isClassified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "subject" TEXT,
ALTER COLUMN "sentiment" SET DEFAULT 'NEUTRAL';

-- AlterTable
ALTER TABLE "FeedbackImport" ADD COLUMN     "skippedRows" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FeedbackImportError" ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "rawValue" TEXT;

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_category_idx" ON "Feedback"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_isRead_idx" ON "Feedback"("workspaceId", "isRead");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_isPinned_idx" ON "Feedback"("workspaceId", "isPinned");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_assignedToId_idx" ON "Feedback"("workspaceId", "assignedToId");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_updatedAt_idx" ON "Feedback"("workspaceId", "updatedAt");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_sentiment_status_idx" ON "Feedback"("workspaceId", "sentiment", "status");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_source_sentiment_idx" ON "Feedback"("workspaceId", "source", "sentiment");

-- CreateIndex
CREATE INDEX "Feedback_assignedToId_idx" ON "Feedback"("assignedToId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_workspaceId_source_externalId_key" ON "Feedback"("workspaceId", "source", "externalId");

-- CreateIndex
CREATE INDEX "FeedbackImportError_feedbackImportId_rowNumber_idx" ON "FeedbackImportError"("feedbackImportId", "rowNumber");

-- CreateIndex
CREATE INDEX "FeedbackImportError_createdAt_idx" ON "FeedbackImportError"("createdAt");

-- CreateIndex
CREATE INDEX "User_workspaceId_createdAt_idx" ON "User"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Workspace_name_idx" ON "Workspace"("name");

-- CreateIndex
CREATE INDEX "Workspace_createdAt_idx" ON "Workspace"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
