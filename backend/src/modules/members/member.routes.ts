import { Router } from "express";

import { validate } from "../../middleware/validate.middleware.js";

import { memberController } from "./member.controller.js";

import {
  changeMemberRoleSchema,
  changeMemberStatusSchema,
  inviteIdSchema,
  inviteMemberSchema,
  listMembersSchema,
  memberIdSchema,
  updateMemberSchema,
} from "./member.validator.js";

const memberRouter = Router();

memberRouter.get("/summary", memberController.summary);

memberRouter.get("/", validate(listMembersSchema), memberController.list);

memberRouter.post(
  "/invite",
  validate(inviteMemberSchema),
  memberController.invite,
);

memberRouter.post(
  "/invites/:inviteId/resend",
  validate(inviteIdSchema),
  memberController.resendInvite,
);

memberRouter.delete(
  "/invites/:inviteId",
  validate(inviteIdSchema),
  memberController.cancelInvite,
);

memberRouter.get(
  "/:memberId",
  validate(memberIdSchema),
  memberController.getById,
);

memberRouter.patch(
  "/:memberId",
  validate(updateMemberSchema),
  memberController.update,
);

memberRouter.patch(
  "/:memberId/role",
  validate(changeMemberRoleSchema),
  memberController.changeRole,
);

memberRouter.patch(
  "/:memberId/status",
  validate(changeMemberStatusSchema),
  memberController.changeStatus,
);

memberRouter.delete(
  "/:memberId",
  validate(memberIdSchema),
  memberController.remove,
);

export default memberRouter;
