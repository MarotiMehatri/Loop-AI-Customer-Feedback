/*
  Warnings:

  - The values [TEAM_MEMBER_INVITED] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('LOGIN', 'LOGOUT', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'AVATAR_UPDATED', 'PREFERENCES_UPDATED', 'MEMBER_INVITED', 'MEMBER_UPDATED', 'MEMBER_ROLE_CHANGED', 'MEMBER_STATUS_CHANGED', 'MEMBER_REMOVED', 'WORKSPACE_CREATED', 'WORKSPACE_UPDATED', 'WORKSPACE_DELETED', 'FEEDBACK_CREATED', 'FEEDBACK_UPDATED', 'FEEDBACK_DELETED', 'FEEDBACK_IMPORTED', 'FEEDBACK_ASSIGNED', 'THEME_CREATED', 'THEME_UPDATED', 'THEME_DELETED', 'THEME_GENERATED', 'REPORT_CREATED', 'REPORT_UPDATED', 'REPORT_GENERATED', 'REPORT_EXPORTED', 'REPORT_DELETED', 'SETTINGS_UPDATED', 'NOTIFICATION_READ', 'NOTIFICATIONS_CLEARED', 'ASK_LOOP_QUESTION', 'DATA_EXPORTED');
ALTER TABLE "ActivityLog" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- DropIndex
DROP INDEX "ActivityLog_type_idx";

-- CreateIndex
CREATE INDEX "ActivityLog_workspaceId_type_idx" ON "ActivityLog"("workspaceId", "type");
