import { mock } from 'bun:test';
import type { LoggerRegistry } from '@be/services/LoggerRegistry';
import type { Logger } from 'pino';

/**
 * Creates a reusable mock logger instance.
 * @returns {Logger} A mock logger.
 */
export const createMockLogger = (): Logger =>
    ({
        debug: mock(),
        error: mock(),
        info: mock(),
        warn: mock(),
        trace: mock(),
        fatal: mock(),
        child: mock().mockReturnThis(),
    }) as unknown as Logger;

/**
 * Creates a reusable mock logger registry.
 * @param logger Optional logger instance to use.
 * @returns {LoggerRegistry} A mock logger registry.
 */
export function createMockLoggerRegistry(logger?: Logger): LoggerRegistry {
    const mockLogger = logger ?? createMockLogger();

    return {
        getLogger: mock().mockReturnValue(mockLogger),
    } as unknown as LoggerRegistry;
}
