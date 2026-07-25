/*
  Warnings:

  - The values [DAILY_SUMMARY,DELIVERY_ALERT,FAILED_DELIVERY,REPORT_READY] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SYSTEM', 'REPORT_CREATED', 'REPORT_COMPLETED', 'REPORT_FAILED', 'REPORT_EXPORTED', 'FEEDBACK_CREATED', 'FEEDBACK_ASSIGNED', 'FEEDBACK_IMPORTED', 'MEMBER_INVITED', 'MEMBER_JOINED', 'MEMBER_ROLE_CHANGED', 'MEMBER_REMOVED', 'WORKSPACE_UPDATED', 'SETTINGS_UPDATED', 'SECURITY_ALERT');
ALTER TABLE "public"."Notification" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropIndex
DROP INDEX "Notification_userId_isRead_idx";

-- DropIndex
DROP INDEX "Notification_userId_type_idx";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Notification_userId_workspaceId_idx" ON "Notification"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "Notification_userId_workspaceId_isRead_idx" ON "Notification"("userId", "workspaceId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_type_idx" ON "Notification"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "Notification_workspaceId_createdAt_idx" ON "Notification"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_entityType_entityId_idx" ON "Notification"("entityType", "entityId");
