import { registerSearchBindings } from '@be/config/container/search';
import { registerStorageBindings } from '@be/config/container/storage';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { container } from 'tsyringe';
import { registerCacheBindings } from './cache';

const appContainer = container.createChildContainer();

appContainer.registerSingleton(LoggerRegistry);

registerStorageBindings(appContainer);
registerCacheBindings(appContainer);
registerSearchBindings(appContainer);

export { appContainer };
