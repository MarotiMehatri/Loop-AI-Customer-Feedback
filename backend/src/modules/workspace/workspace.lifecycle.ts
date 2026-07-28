import { ApiError } from "../../utils/apiError.js";
import {
  WORKSPACE_DELETE_CONFIRMATION,
  WORKSPACE_MESSAGES,
} from "./workspace.constants.js";
import { workspaceRepository } from "./workspace.repository.js";
import type {
  DeleteWorkspaceInput,
  WorkspaceContext,
} from "./workspace.types.js";
import { assertPermission } from "../../permissions/rolePermissions.js";
import { PERMISSION } from "../../permissions/permission.types.js";

export async function deleteWorkspace(
  context: WorkspaceContext,
  input: DeleteWorkspaceInput,
): Promise<void> {
  assertPermission(
    context.role,
    PERMISSION.WORKSPACE_DELETE,
    "Only administrators can delete the workspace",
  );

  if (input.confirmation !== WORKSPACE_DELETE_CONFIRMATION) {
    throw new ApiError(400, WORKSPACE_MESSAGES.invalidDeleteConfirmation);
  }

  const workspace = await workspaceRepository.findById(context.workspaceId);
  if (!workspace) {
    throw new ApiError(404, WORKSPACE_MESSAGES.notFound);
  }

  const result = await workspaceRepository.deleteById(context.workspaceId);
  if (result.count === 0) {
    throw new ApiError(404, WORKSPACE_MESSAGES.notFound);
  }
}
