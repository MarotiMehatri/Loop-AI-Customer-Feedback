import { Job, JobStatus } from "./job.types.js";
import logger from "../config/logger.js";
import { randomUUID } from "crypto";

const jobs = new Map<string, Job>();

export function createJob(
  name: string,
  data: Record<string, unknown> = {},
): Job {
  const id = randomUUID();
  const job: Job = {
    id,
    name,
    status: JobStatus.PENDING,
    data,
    result: null,
    error: null,
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
  };
  jobs.set(id, job);
  logger.info(`Job created: ${id} (${name})`);
  return job;
}

export function updateJob(id: string, updates: Partial<Omit<Job, "id">>): Job | null {
  const job = jobs.get(id);
  if (!job) {
    logger.warn(`Job not found: ${id}`);
    return null;
  }
  Object.assign(job, updates);
  return job;
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function listJobs(): Job[] {
  return Array.from(jobs.values());
}
