// start-queue-server.ts

import 'reflect-metadata';
import { appContainer } from '@be/config/container';
import { HelloWorldJob } from '@be/jobs/HelloWorldJob';
import { SharedQueue } from '@be/resque/SharedQueue';
import { startAll } from '@be/resque/resque-boot';
import { LoggerRegistry } from '@be/services/LoggerRegistry';

async function bootstrap() {
    const logger = appContainer.resolve(LoggerRegistry).getLogger('Workers');

    const sharedQueue = appContainer.resolve(SharedQueue);
    await sharedQueue.init();

    const jobs = [appContainer.resolve(HelloWorldJob)];

    const { scheduler, worker } = await startAll(logger, sharedQueue, jobs);

    process.on('SIGINT', async () => {
        await Promise.all([worker.end(), scheduler.end(), sharedQueue.getRedisClient().quit()]);
        process.exit(0);
    });
}

bootstrap().catch((err) => {
    console.error('❌ Failed to start Resque:', err);
    process.exit(1);
});
