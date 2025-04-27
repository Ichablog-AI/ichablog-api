import type { JobSpecInterface, RetryOptions } from '@be/resque/JobSpecInterface';
import type { SharedQueue } from '@be/resque/SharedQueue';
import type { Logger } from 'pino';

/**
 * Abstract base class for defining queueable jobs.
 *
 * @template T - The shape of the parameters object for this job.
 */
export abstract class JobBase<T> implements JobSpecInterface<T> {
    /**
     * The Redis-backed queue name this job is enqueued into.
     */
    abstract readonly queueName: string;

    /**
     * Unique name identifying this job.
     */
    abstract readonly jobName: string;

    /**
     * SharedQueue instance for enqueuing jobs.
     */
    protected readonly sharedQueue: SharedQueue;

    /**
     * Logger instance for structured logging within the job.
     */
    protected readonly logger: Logger;

    /**
     * Optional retry and back-off configuration for this job.
     */
    retryOptions?: RetryOptions;

    /**
     * Creates a new JobBase.
     *
     * @param sharedQueue - The shared queue client for enqueuing work.
     * @param logger - A Pino logger for logging job events.
     */
    protected constructor(sharedQueue: SharedQueue, logger: Logger) {
        this.sharedQueue = sharedQueue;
        this.logger = logger;
    }

    /**
     * Core processing logic that runs when the worker picks up a job.
     *
     * @param params - The parameters object defining the job payload.
     * @returns A promise that resolves when processing completes.
     */
    abstract processor(params: T): Promise<void>;

    /**
     * Enqueues a job with the given parameters.
     *
     * @param params - The parameters object defining the job payload.
     * @returns A promise that resolves once the job has been enqueued.
     */
    async enqueue(params: T): Promise<boolean> {
        this.logger.debug({ jobName: this.jobName, params }, 'Enqueueing job with params:');
        return this.sharedQueue.enqueue(this.queueName, this.jobName, [params]);
    }
}
