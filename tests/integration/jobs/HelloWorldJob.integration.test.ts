import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test';
import { appContainer } from '@be/config/container';
import { HelloWorldJob } from '@be/jobs/HelloWorldJob';
import { SharedQueue } from '@be/resque/SharedQueue';
import Redis from 'ioredis';

describe('HelloWorldJob (integration)', () => {
    const sharedQueue = appContainer.resolve(SharedQueue);
    const producer = appContainer.resolve(HelloWorldJob);
    const redis = appContainer.resolve(Redis);

    beforeAll(async () => {
        await sharedQueue.init();
    });

    beforeEach(async () => {
        await redis.flushdb();
    });

    afterAll(async () => {
        await redis.quit();
    });

    it('should enqueue a HelloWorldJob payload into Redis', async () => {
        const params = { name: 'John Doe', age: 30 };
        const ok = await producer.enqueue(params);
        expect(ok).toBe(true);

        const key = `resque:queue:${producer.queueName}`;
        const entries = await redis.lrange(key, 0, -1);
        const raw = entries[0];
        expect(raw).not.toBeNull();

        const parsed = JSON.parse(String(raw));
        // Check the envelope
        expect(parsed).toHaveProperty('class', producer.jobName);
        expect(parsed).toHaveProperty('queue', producer.queueName);

        // Check that args is an array and contains your params
        expect(Array.isArray(parsed.args)).toBe(true);
        expect(parsed.args[0]).toEqual(params);
    });
});
