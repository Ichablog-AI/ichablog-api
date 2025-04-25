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
        try {
            await AppDataSource.initialize();
            logger.info('Database initialized.');
        } catch (error) {
            logger.error(error, 'Database initialization failed.');
        }

        logger.info('Initializing application...');
        try {
            const app = createApp();
            Bun.serve({
                hostname: appConfig.httpServer.host,
                port: appConfig.httpServer.port,
                fetch: app.fetch,
            });
            logger.info(
                `🟢  Listening on ${appConfig.httpServer.protocol}://${appConfig.httpServer.host}:${appConfig.httpServer.port}`
            );
            logger.info('Application initialized.');
        } catch (error) {
            logger.error(error, 'Application initialization failed.');
        }
    } catch (error) {
        logger.error(error);
    }
})();
