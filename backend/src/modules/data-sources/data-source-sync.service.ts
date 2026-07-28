import { dataSourceRepository } from "./data-source.repository.js";

import { dataSourceSimulatorService } from "./data-source-simulator.service.js";

import type {
  DataSourceActorContext,
  SyncResult,
} from "./data-source.types.js";

export const dataSourceSyncService = {
  async sync(
    actor: DataSourceActorContext,
    dataSourceId: string,
  ): Promise<SyncResult> {
    const dataSource = await dataSourceRepository.findById(
      dataSourceId,
      actor.workspaceId,
    );

    if (!dataSource) {
      return {
        dataSourceId,
        status: "failed",
        recordsProcessed: 0,
        recordsAdded: 0,
        recordsUpdated: 0,
        errors: ["Data source was not found"],
        startedAt: new Date(),
        completedAt: new Date(),
      };
    }

    await dataSourceRepository.updateStatus(
      dataSourceId,
      actor.workspaceId,
      "SYNCING",
    );

    const startedAt = new Date();

    try {
      const simulatedCount = await dataSourceSimulatorService.simulate({
        sourceType: dataSource.type as never,
        intervalMs: 1000,
        maxRecords: 50,
        schema: {},
      });

      await dataSourceRepository.updateStatus(
        dataSourceId,
        actor.workspaceId,
        "ACTIVE",
      );

      return {
        dataSourceId,
        status: "completed",
        recordsProcessed: simulatedCount,
        recordsAdded: simulatedCount,
        recordsUpdated: 0,
        errors: [],
        startedAt,
        completedAt: new Date(),
      };
    } catch (error) {
      await dataSourceRepository.updateStatus(
        dataSourceId,
        actor.workspaceId,
        "ERROR",
      );

      return {
        dataSourceId,
        status: "failed",
        recordsProcessed: 0,
        recordsAdded: 0,
        recordsUpdated: 0,
        errors: [error instanceof Error ? error.message : "Sync failed"],
        startedAt,
        completedAt: new Date(),
      };
    }
  },
};
