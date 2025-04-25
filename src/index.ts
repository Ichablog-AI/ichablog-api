import 'reflect-metadata';
import appConfig from '@be/config';
import { appContainer } from '@be/config/container';
import { AppDataSource } from '@be/database/data-source';
import { createApp } from '@be/server';
import { LoggerRegistry } from '@be/services/LoggerRegistry';

const logger = appContainer.resolve(LoggerRegistry).getLogger('AppBootstrap');

(async () => {
    try {
        logger.info('Initializing database...');
        await AppDataSource.initialize();
        logger.info('Database initialized.');

        logger.info('Initializing application...');
        const app = createApp();
        Bun.serve({
            hostname: appConfig.httpServer.host,
            port: appConfig.httpServer.port,
            fetch: app.fetch,
        });
        logger.info('Application initialized.');

        logger.info(
            `🟢 Listening on ${appConfig.httpServer.protocol}://${appConfig.httpServer.host}:${appConfig.httpServer.port}`
        );
    } catch (error) {
        logger.error(error);
    }
})();
