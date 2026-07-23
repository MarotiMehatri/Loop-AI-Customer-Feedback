-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "FeedbackImport" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "successfulRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "duplicateRows" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "workspaceId" TEXT NOT NULL,
    "importedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackImportError" (
    "id" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "field" TEXT,
    "rawData" JSONB,
    "errorMessage" TEXT NOT NULL,
    "feedbackImportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackImportError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackImport_workspaceId_idx" ON "FeedbackImport"("workspaceId");

-- CreateIndex
CREATE INDEX "FeedbackImport_importedById_idx" ON "FeedbackImport"("importedById");

-- CreateIndex
CREATE INDEX "FeedbackImport_workspaceId_status_idx" ON "FeedbackImport"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "FeedbackImport_createdAt_idx" ON "FeedbackImport"("createdAt");

-- CreateIndex
CREATE INDEX "FeedbackImportError_feedbackImportId_idx" ON "FeedbackImportError"("feedbackImportId");

-- AddForeignKey
ALTER TABLE "FeedbackImport" ADD CONSTRAINT "FeedbackImport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackImport" ADD CONSTRAINT "FeedbackImport_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackImportError" ADD CONSTRAINT "FeedbackImportError_feedbackImportId_fkey" FOREIGN KEY ("feedbackImportId") REFERENCES "FeedbackImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
