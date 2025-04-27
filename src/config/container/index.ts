import appConfig from '@be/config';
import { registerCacheBindings } from '@be/config/container/cache';
import { registerSearchBindings } from '@be/config/container/search';
import { registerStorageBindings } from '@be/config/container/storage';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { registerSingletonFactory } from '@be/utils/registerSingletonFactory';
import Redis from 'ioredis';
import { container } from 'tsyringe';

const appContainer = container.createChildContainer();

appContainer.registerSingleton(LoggerRegistry);
registerSingletonFactory(appContainer, Redis, () => new Redis(appConfig.queue.redisUrl));

registerStorageBindings(appContainer);
registerCacheBindings(appContainer);
registerSearchBindings(appContainer);

export { appContainer };
