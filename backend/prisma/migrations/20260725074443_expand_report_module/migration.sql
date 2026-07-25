/*
  Warnings:

  - Added the required column `updatedAt` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('VOICE_OF_CUSTOMER', 'INSIGHTS', 'ANALYTICS', 'SUMMARY', 'SENTIMENT', 'THEMES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportExportFormat" AS ENUM ('PDF', 'CSV', 'XLSX');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "charts" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "filters" JSONB,
ADD COLUMN     "generatedAt" TIMESTAMP(3),
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sources" JSONB,
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ReportType" NOT NULL;

-- CreateTable
CREATE TABLE "ReportTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ReportType" NOT NULL,
    "sources" JSONB,
    "filters" JSONB,
    "metrics" JSONB,
    "charts" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportExport" (
    "id" TEXT NOT NULL,
    "format" "ReportExportFormat" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportId" TEXT NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "ReportExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledReport" (
    "id" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "cronExpression" TEXT,
    "recipients" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "ScheduledReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportTemplate_workspaceId_idx" ON "ReportTemplate"("workspaceId");

-- CreateIndex
CREATE INDEX "ReportTemplate_workspaceId_type_idx" ON "ReportTemplate"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "ReportExport_reportId_idx" ON "ReportExport"("reportId");

-- CreateIndex
CREATE INDEX "ReportExport_createdAt_idx" ON "ReportExport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledReport_reportId_key" ON "ScheduledReport"("reportId");

-- CreateIndex
CREATE INDEX "ScheduledReport_isActive_idx" ON "ScheduledReport"("isActive");

-- CreateIndex
CREATE INDEX "ScheduledReport_nextRunAt_idx" ON "ScheduledReport"("nextRunAt");

-- CreateIndex
CREATE INDEX "Report_workspaceId_type_idx" ON "Report"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "Report_workspaceId_status_idx" ON "Report"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Report_workspaceId_createdAt_idx" ON "Report"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReportTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportTemplate" ADD CONSTRAINT "ReportTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExport" ADD CONSTRAINT "ReportExport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportExport" ADD CONSTRAINT "ReportExport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledReport" ADD CONSTRAINT "ScheduledReport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
