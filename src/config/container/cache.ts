import appConfig from '@be/config';
import { CacheService, type CacheServiceParams } from '@be/services/CacheService';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { registerSingletonFactory } from '@be/utils/registerSingletonFactory';
import type { DependencyContainer } from 'tsyringe';

/**
 * Registers all bucket-specific Storage instances in the DI container.
 */
export const registerCacheBindings = (container: DependencyContainer) => {
    registerSingletonFactory(
        container,
        CacheService,
        (c) =>
            new CacheService({
                ...(appConfig.cache as CacheServiceParams),
                loggerRegistry: c.resolve(LoggerRegistry),
            })
    );
};
