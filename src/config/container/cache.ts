import appConfig from '@be/config';
import { CacheService, type CacheServiceParams } from '@be/services/CacheService';
import type { DependencyContainer } from 'tsyringe';

/**
 * Registers all bucket-specific Storage instances in the DI container.
 */
export const registerCacheBindings = (container: DependencyContainer) => {
    container.register<CacheService>(CacheService, {
        useFactory: () => new CacheService(appConfig.cache as CacheServiceParams),
    });
};
