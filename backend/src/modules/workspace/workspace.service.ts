import { ActivityType } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/apiError.js";
import { activityLogger } from "../activity/activity.logger.js";
import { WORKSPACE_MESSAGES } from "./workspace.constants.js";
import { normalizeWorkspaceName } from "./workspace.helper.js";
import { deleteWorkspace } from "./workspace.lifecycle.js";
import { mapWorkspace } from "./workspace.mapper.js";
import { workspaceRepository } from "./workspace.repository.js";
import type {
  DeleteWorkspaceInput,
  UpdateWorkspaceInput,
  WorkspaceContext,
} from "./workspace.types.js";
import { assertPermission } from "../../permissions/rolePermissions.js";
import { PERMISSION } from "../../permissions/permission.types.js";

export const workspaceService = {
  async get(context: WorkspaceContext) {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_READ,
      "You do not have permission to view this workspace",
    );

    const workspace = await workspaceRepository.findById(context.workspaceId);
    if (!workspace) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    return mapWorkspace(workspace);
  },

  async getSummary(context: WorkspaceContext) {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_READ,
      "You do not have permission to view this workspace",
    );

    const workspace = await workspaceRepository.findById(context.workspaceId);
    if (!workspace) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    return workspaceRepository.getSummary(context.workspaceId);
  },

  async update(context: WorkspaceContext, input: UpdateWorkspaceInput) {
    assertPermission(
      context.role,
      PERMISSION.WORKSPACE_UPDATE,
      "You do not have permission to update this workspace",
    );

    const updated = await workspaceRepository.updateName(
      context.workspaceId,
      normalizeWorkspaceName(input.name),
    );

    if (!updated) throw new ApiError(404, WORKSPACE_MESSAGES.notFound);

    await activityLogger.logSafe({
      userId: context.userId,
      workspaceId: context.workspaceId,
      type: ActivityType.WORKSPACE_UPDATED,
      title: "Workspace updated",
      description: `Workspace "${updated.name}" was updated.`,
      entityType: "WORKSPACE",
      entityId: updated.id,
      metadata: { updatedFields: ["name"] },
    });

    return mapWorkspace(updated);
  },

  async remove(
    context: WorkspaceContext,
    input: DeleteWorkspaceInput,
  ): Promise<void> {
    await deleteWorkspace(context, input);
  },
};
