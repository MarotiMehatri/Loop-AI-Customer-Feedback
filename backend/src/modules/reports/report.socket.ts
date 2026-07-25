import { EventEmitter } from "node:events";

export type ReportProgressStage =
  | "QUEUED"
  | "COLLECTING_DATA"
  | "ANALYZING"
  | "GENERATING_SUMMARY"
  | "SAVING"
  | "COMPLETED"
  | "FAILED";

export interface ReportProgressEvent {
  reportId: string;
  workspaceId: string;
  stage: ReportProgressStage;
  progress: number;
  message: string;
  createdAt: Date;
}

class ReportEventBus extends EventEmitter {
  emitProgress(event: ReportProgressEvent): void {
    this.emit(`report:${event.reportId}`, event);

    this.emit(`workspace:${event.workspaceId}`, event);
  }

  subscribeToReport(
    reportId: string,
    listener: (event: ReportProgressEvent) => void,
  ): () => void {
    const eventName = `report:${reportId}`;

    this.on(eventName, listener);

    return () => {
      this.off(eventName, listener);
    };
  }
}

export const reportSocket = new ReportEventBus();
