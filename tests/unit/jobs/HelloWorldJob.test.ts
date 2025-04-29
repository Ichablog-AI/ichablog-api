import { describe, expect, it, mock } from 'bun:test';
import { HelloWorldJob, type HelloWorldJobParams } from '@be/jobs/HelloWorldJob';
import type { SharedQueue } from '@be/resque/SharedQueue';
import { createMockLogger, createMockLoggerRegistry } from '@be/test-mocks/MockedLoggerRegistry';

describe('HelloWorldJob', () => {
    it('should log the correct greeting message with name and age', async () => {
        const sharedQueue = mock() as unknown as SharedQueue;
        const logger = createMockLogger();
        const loggerRegistry = createMockLoggerRegistry(logger);
        const job = new HelloWorldJob(sharedQueue, loggerRegistry);

        const params: HelloWorldJobParams = {
            name: 'Billy',
            age: 23,
        };

        await job.processor(params);

        expect(logger.info).toHaveBeenCalledWith(`👋 Hello, ${params.name}! Age: ${params.age ?? 'unknown'}`);
    });
});
