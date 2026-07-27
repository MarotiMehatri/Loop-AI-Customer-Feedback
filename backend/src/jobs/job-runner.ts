import { Job, JobStatus } from "./job.types.js";
import { createJob, updateJob, getJob } from "./job.repository.js";
import logger from "../config/logger.js";

type WorkerFn = (data: Record<string, unknown>) => Promise<unknown>;

export class JobRunner {
  private workers = new Map<string, WorkerFn>();

  registerWorker(name: string, fn: WorkerFn): void {
    this.workers.set(name, fn);
    logger.info(`Worker registered: ${name}`);
  }

  async runJob(
    name: string,
    data: Record<string, unknown> = {},
  ): Promise<Job> {
    const worker = this.workers.get(name);
    if (!worker) {
      const job = createJob(name, data);
      updateJob(job.id, {
        status: JobStatus.FAILED,
        error: `No worker registered for: ${name}`,
        completedAt: new Date(),
      });
      return getJob(job.id)!;
    }

    const job = createJob(name, data);

    // Run asynchronously
    this.executeWorker(job.id, worker, data).catch((err) => {
      logger.error(`Unexpected error in job ${job.id}: ${err}`);
    });

    return getJob(job.id)!;
  }

  private async executeWorker(
    id: string,
    worker: WorkerFn,
    data: Record<string, unknown>,
  ): Promise<void> {
    updateJob(id, { status: JobStatus.RUNNING, startedAt: new Date() });

    try {
      const result = await worker(data);
      updateJob(id, {
        status: JobStatus.COMPLETED,
        result,
        completedAt: new Date(),
      });
      logger.info(`Job completed: ${id}`);
    } catch (err) {
      updateJob(id, {
        status: JobStatus.FAILED,
        error: err instanceof Error ? err.message : String(err),
        completedAt: new Date(),
      });
      logger.error(`Job failed: ${id} - ${err}`);
    }
  }

  getJobStatus(id: string): Job | undefined {
    return getJob(id);
  }
}

export const jobRunner = new JobRunner();
