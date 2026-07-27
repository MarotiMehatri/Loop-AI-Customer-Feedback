import { logger } from "./logger.js";

export interface CronJob {
  name: string;
  intervalMs: number;
  handler: () => Promise<void>;
}

export interface ScheduledJob extends CronJob {
  timer: ReturnType<typeof setInterval> | null;
  running: boolean;
}

const jobs = new Map<string, ScheduledJob>();

function createScheduledJob(job: CronJob): ScheduledJob {
  return {
    ...job,
    timer: null,
    running: false,
  };
}

async function runJob(scheduled: ScheduledJob): Promise<void> {
  if (scheduled.running) {
    logger.warn(`[Cron] Job "${scheduled.name}" already running, skipping`);
    return;
  }

  scheduled.running = true;

  try {
    await scheduled.handler();
  } catch (error) {
    logger.error(`[Cron] Job "${scheduled.name}" failed`, error);
  } finally {
    scheduled.running = false;
  }
}

export function registerJob(job: CronJob): void {
  if (jobs.has(job.name)) {
    logger.warn(`[Cron] Job "${job.name}" is already registered`);
    return;
  }

  const scheduled = createScheduledJob(job);
  jobs.set(job.name, scheduled);

  logger.info(`[Cron] Registered job "${job.name}" (every ${job.intervalMs}ms)`);
}

export function startJob(name: string): void {
  const scheduled = jobs.get(name);

  if (!scheduled) {
    logger.warn(`[Cron] Cannot start unknown job "${name}"`);
    return;
  }

  if (scheduled.timer) {
    logger.warn(`[Cron] Job "${name}" is already running`);
    return;
  }

  scheduled.timer = setInterval(() => {
    void runJob(scheduled);
  }, scheduled.intervalMs);

  logger.info(`[Cron] Started job "${name}"`);
}

export function stopJob(name: string): void {
  const scheduled = jobs.get(name);

  if (!scheduled || !scheduled.timer) {
    return;
  }

  clearInterval(scheduled.timer);
  scheduled.timer = null;

  logger.info(`[Cron] Stopped job "${name}"`);
}

export function startAllJobs(): void {
  for (const name of jobs.keys()) {
    startJob(name);
  }
}

export function stopAllJobs(): void {
  for (const name of jobs.keys()) {
    stopJob(name);
  }
}
