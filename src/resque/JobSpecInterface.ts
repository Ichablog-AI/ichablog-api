export interface RetryOptions {
    retries?: number;
    backoff?: boolean;
    backoffDelay?: number;
    backoffExponent?: number;
}

/**
 * P is the shape of the params object your job takes.
 * Defaults to Record<string, unknown> for backward compatibility.
 */
export interface JobSpecInterface<P = Record<string, unknown>> {
    /** Redis list name */
    queueName: string;

    /** Unique job identifier */
    jobName: string;

    /** Consumer-side logic: receives the full params object */
    processor: (params: P) => Promise<void>;

    /** Retry/back-off settings */
    retryOptions?: RetryOptions;

    /** Producer-side helper: enqueues the full params object */
    enqueue?: (params: P) => Promise<boolean>;
}
