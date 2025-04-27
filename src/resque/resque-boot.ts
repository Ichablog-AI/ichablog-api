// src/resque/resque-boot.ts

import { Scheduler, Worker } from 'node-resque';
import type { Logger } from 'pino';
import type { JobSpecInterface } from './JobSpecInterface';
import type { SharedQueue } from './SharedQueue';

/** Minimal shape of a job definition for node-resque */
type ResqueJobDef = {
    perform: (...args: unknown[]) => Promise<void>;
    retry?: number;
    backoff?: {
        delay?: number;
        factor?: number;
    };
};

/**
 * Start the Resque scheduler.
 */
export async function startScheduler(sharedQueue: SharedQueue, logger: Logger): Promise<Scheduler> {
    const redis = sharedQueue.getRedisClient();
    logger.info('Starting Resque scheduler');

    const scheduler = new Scheduler({ connection: { redis } });
    scheduler.on('error', (err) => logger.error({ err }, 'Scheduler error'));

    await scheduler.connect();
    scheduler.start(); // synchronous kickoff
    logger.info('✅ Resque scheduler started');
    return scheduler;
}

/**
 * Start a Resque worker for the given job specs.
 *
 * All job specs are typed as taking `unknown` payloads, so
 * there's no `any` anywhere.
 */
export async function startWorker(
    sharedQueue: SharedQueue,
    jobSpecs: JobSpecInterface<unknown>[],
    logger: Logger
): Promise<Worker> {
    const redis = sharedQueue.getRedisClient();
    logger.info('Preparing Resque worker');

    const jobs: Record<string, ResqueJobDef> = {};
    const queues = new Set<string>();

    for (const spec of jobSpecs) {
        logger.debug(
            { job: spec.jobName, queue: spec.queueName, retryOptions: spec.retryOptions },
            'Registering job spec'
        );
        queues.add(spec.queueName);

        const performFn: ResqueJobDef['perform'] = async (...args: unknown[]) => {
            logger.debug({ job: spec.jobName, args }, 'Performing job');
            // first arg is the payload
            const payload = args[0];
            await spec.processor(payload);
        };

        jobs[spec.jobName] = {
            perform: performFn,
            retry: spec.retryOptions?.retries,
            backoff: spec.retryOptions?.backoff
                ? {
                      delay: spec.retryOptions.backoffDelay,
                      factor: spec.retryOptions.backoffExponent,
                  }
                : undefined,
        };
    }

    const queueList = Array.from(queues);
    logger.info({ queues: queueList }, 'Starting worker on queues');

    const worker = new Worker({ connection: { redis }, queues: queueList }, jobs);

    worker.on('start', () => logger.info({ queues: queueList }, '✅ Resque worker started'));
    worker.on('error', (queue, job, err) => logger.error({ queue, job, err }, 'Worker error'));

    await worker.connect();
    worker.start();
    return worker;
}

/**
 * Convenience: start both scheduler and worker.
 */
export async function startAll(
    logger: Logger,
    sharedQueue: SharedQueue,
    // biome-ignore lint/suspicious/noExplicitAny: any JobSpecInterface is allowed
    jobSpecs: JobSpecInterface<any>[]
): Promise<{ scheduler: Scheduler; worker: Worker }> {
    logger.info('Bootstrapping scheduler and worker together');
    const scheduler = await startScheduler(sharedQueue, logger);
    const worker = await startWorker(sharedQueue, jobSpecs, logger);
    logger.info('✅ Resque scheduler & worker are running');
    return { scheduler, worker };
}
