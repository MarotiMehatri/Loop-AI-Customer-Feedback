import type { WorkspaceResponse } from "./workspace.types.js";

export interface WorkspaceRecord {
  id: string;
  name: string;
  createdAt: Date;
}

export function mapWorkspace(workspace: WorkspaceRecord): WorkspaceResponse {
  return {
    id: workspace.id,
    name: workspace.name,
    createdAt: workspace.createdAt,
  };
}
