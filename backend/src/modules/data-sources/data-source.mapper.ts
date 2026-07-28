import type { Prisma } from "../../generated/prisma/client.js";

import type {
  DataSourceStatus,
  DataSourceType,
} from "./data-source.types.js";

export type DataSourceRecord = Prisma.DataSourceGetPayload<{
  include: {
    createdBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export interface DataSourceResponse {
  id: string;
  name: string;
  type: DataSourceType;
  description: string | null;
  status: DataSourceStatus;
  isActive: boolean;
  config: Record<string, unknown>;
  lastSyncAt: Date | null;
  workspaceId: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export function mapDataSource(source: DataSourceRecord): DataSourceResponse {
  return {
    id: source.id,
    name: source.name,
    type: source.type as DataSourceType,
    description: source.description,
    status: source.status as DataSourceStatus,
    isActive: source.isActive,
    config: source.config as Record<string, unknown>,
    lastSyncAt: source.lastSyncAt,
    workspaceId: source.workspaceId,
    createdBy: source.createdBy,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

export function mapDataSourceList(
  sources: DataSourceRecord[],
): DataSourceResponse[] {
  return sources.map(mapDataSource);
}
