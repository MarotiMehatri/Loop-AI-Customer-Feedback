-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'ACTIONED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FeedbackChannel" AS ENUM ('SUPPORT', 'APP_STORE', 'SURVEY', 'SALES', 'SOCIAL', 'WEBSITE', 'EMAIL', 'MANUAL');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "source" "FeedbackChannel" NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "customerName" TEXT,
    "customerEmail" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_idx" ON "Feedback"("workspaceId");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_status_idx" ON "Feedback"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_source_idx" ON "Feedback"("workspaceId", "source");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_sentiment_idx" ON "Feedback"("workspaceId", "sentiment");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_isImportant_idx" ON "Feedback"("workspaceId", "isImportant");

-- CreateIndex
CREATE INDEX "Feedback_workspaceId_createdAt_idx" ON "Feedback"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_createdById_idx" ON "Feedback"("createdById");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
