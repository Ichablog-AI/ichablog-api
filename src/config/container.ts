import { container } from 'tsyringe';
import { LoggerRegistry } from '../services/LoggerRegistry.js';

const appContainer = container.createChildContainer();

appContainer.registerSingleton(LoggerRegistry);

export { appContainer };
