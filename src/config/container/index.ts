import { registerStorageBindings } from '@be/config/container/storage';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { container } from 'tsyringe';

const appContainer = container.createChildContainer();

appContainer.registerSingleton(LoggerRegistry);

registerStorageBindings(appContainer);

export { appContainer };
