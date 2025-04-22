import appConfig from '@be/config';
import { registerStorageBindings } from '@be/config/container/storage';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { Client as MinioClient } from 'minio';
import { container } from 'tsyringe';

const appContainer = container.createChildContainer();

appContainer.registerSingleton(LoggerRegistry);

appContainer.register<MinioClient>(MinioClient, {
  useFactory: () => new MinioClient(appConfig.minio.clientOptions),
});

registerStorageBindings(appContainer);

export { appContainer };
