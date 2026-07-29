import { Router } from "express";

import { authorize } from "../../middleware/authorize.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  cancelInviteController,
  changeMemberRoleController,
  changeMemberStatusController,
  getMemberController,
  inviteMemberController,
  listInvitesController,
  listMembersController,
  memberSummaryController,
  removeMemberController,
  resendInviteController,
  updateMemberController,
} from "./member.controller.js";

import {
  changeMemberRoleSchema,
  changeMemberStatusSchema,
  listMembersSchema,
  memberIdSchema,
  updateMemberSchema,
} from "./member.validator.js";

import {
  inviteIdSchema,
  inviteMemberSchema,
  listInvitesSchema,
} from "./member-invite.validator.js";

const memberRouter = Router();

memberRouter.get(
  "/summary",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(memberSummaryController),
);

memberRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(listMembersSchema),
  asyncHandler(listMembersController),
);

memberRouter.post(
  "/invite",
  authorize("ADMIN", "ANALYST"),
  validate(inviteMemberSchema),
  asyncHandler(inviteMemberController),
);

memberRouter.get(
  "/invites",
  authorize("ADMIN", "ANALYST"),
  validate(listInvitesSchema),
  asyncHandler(listInvitesController),
);

memberRouter.post(
  "/invites/:inviteId/resend",
  authorize("ADMIN", "ANALYST"),
  validate(inviteIdSchema),
  asyncHandler(resendInviteController),
);

memberRouter.delete(
  "/invites/:inviteId",
  authorize("ADMIN", "ANALYST"),
  validate(inviteIdSchema),
  asyncHandler(cancelInviteController),
);

memberRouter.get(
  "/:memberId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(memberIdSchema),
  asyncHandler(getMemberController),
);

memberRouter.patch(
  "/:memberId",
  authorize("ADMIN", "ANALYST"),
  validate(updateMemberSchema),
  asyncHandler(updateMemberController),
);

memberRouter.patch(
  "/:memberId/role",
  authorize("ADMIN", "ANALYST"),
  validate(changeMemberRoleSchema),
  asyncHandler(changeMemberRoleController),
);

memberRouter.patch(
  "/:memberId/status",
  authorize("ADMIN", "ANALYST"),
  validate(changeMemberStatusSchema),
  asyncHandler(changeMemberStatusController),
);

memberRouter.delete(
  "/:memberId",
  authorize("ADMIN"),
  validate(memberIdSchema),
  asyncHandler(removeMemberController),
);

export default memberRouter;
