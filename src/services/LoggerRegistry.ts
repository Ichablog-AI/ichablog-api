import { baseLogger } from '@be/utils/logger';
import type { Logger } from 'pino';
import { injectable } from 'tsyringe';

/**
 * LoggerRegistry manages child logger instances by name.
 */
@injectable()
export class LoggerRegistry {
    loggers: Map<string, Logger>;

    constructor() {
        this.loggers = new Map();
    }

    /**
     * Get or create a named child logger.
     * @param loggerName The unique name for the child logger.
     * @returns Logger instance tagged with loggerName.
     */
    getLogger(loggerName: string): Logger {
        if (this.loggers.has(loggerName)) {
            const cached = this.loggers.get(loggerName);
            if (cached) return cached;
        }

        const childLogger = baseLogger.child({ name: loggerName });
        this.loggers.set(loggerName, childLogger);
        return childLogger;
    }

    /**
     * Get the base/root logger without child metadata.
     */
    getBaseLogger(): Logger {
        return baseLogger;
    }
}
