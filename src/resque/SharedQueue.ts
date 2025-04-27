import { Redis } from 'ioredis';
import { Queue } from 'node-resque';
import { inject, singleton } from 'tsyringe';

@singleton()
export class SharedQueue {
    protected readonly queue: Queue;
    protected readonly redis: Redis;

    constructor(@inject(Redis) redisClient: Redis) {
        this.redis = redisClient;
        this.queue = new Queue({
            connection: { redis: this.redis },
        });
    }

    /**
     * Establish the Redis connection once per process
     */
    async init(): Promise<void> {
        await this.queue.connect();
    }

    /**
     * Enqueue a job immediately; we await the boolean result internally
     * so callers always get Promise<void> back.
     */
    enqueue(queueName: string, jobName: string, args: unknown[]): Promise<boolean> {
        return this.queue.enqueue(queueName, jobName, args);
    }

    /**
     * Enqueue a job to run after a delay (in milliseconds)
     */
    enqueueIn(ms: number, queueName: string, jobName: string, args: unknown[]): Promise<boolean> {
        return this.queue.enqueueIn(ms, queueName, jobName, args);
    }

    /**
     * Access the underlying Queue instance
     */
    getQueue(): Queue {
        return this.queue;
    }

    getRedisClient(): Redis {
        return this.redis;
    }
}
