import appConfig from '@be/config';
import pino from 'pino';

/**
 * Logger instance using pino with config from env.
 */
export const baseLogger = pino({
    level: appConfig.logger.level,
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                level: appConfig.logger.level || 'info',
                options: {
                    colorize: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
                    ignore: 'pid,hostname',
                },
            },
            {
                target: 'pino/file',
                level: 'fatal',
                options: {
                    destination: './logs/fatal.log',
                },
            },
            {
                target: 'pino/file',
                level: 'error',
                options: {
                    destination: './logs/error.log',
                },
            },
            {
                target: 'pino/file',
                level: 'warn',
                options: {
                    destination: './logs/warn.log',
                },
            },
            {
                target: 'pino/file',
                level: 'info',
                options: {
                    destination: './logs/info.log',
                },
            },
            {
                target: 'pino/file',
                level: 'debug',
                options: { destination: './logs/debug.log' },
            },
        ],
    },
});
