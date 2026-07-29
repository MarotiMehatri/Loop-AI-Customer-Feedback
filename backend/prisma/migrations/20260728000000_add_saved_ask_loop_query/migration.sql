-- CreateTable
CREATE TABLE "SavedAskLoopQuery" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedAskLoopQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedAskLoopQuery_workspaceId_userId_idx" ON "SavedAskLoopQuery"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "SavedAskLoopQuery_workspaceId_userId_createdAt_idx" ON "SavedAskLoopQuery"("workspaceId", "userId", "createdAt");

-- AddForeignKey
ALTER TABLE "SavedAskLoopQuery" ADD CONSTRAINT "SavedAskLoopQuery_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAskLoopQuery" ADD CONSTRAINT "SavedAskLoopQuery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
