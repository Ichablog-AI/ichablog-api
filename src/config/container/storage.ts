import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { Storage } from '@be/services/Storage';
import { Client as MinioClient } from 'minio';
import type { DependencyContainer } from 'tsyringe';

/** Unique tokens for resolving Storage instances */
export const POST_IMAGE_STORAGE = 'PostImageStorage' as const;
export const PROFILE_IMAGE_STORAGE = 'ProfileImageStorage' as const;

type POST_IMAGE_STORAGE = typeof POST_IMAGE_STORAGE;
type PROFILE_IMAGE_STORAGE = typeof PROFILE_IMAGE_STORAGE;

/**
 * Registers all bucket-specific Storage instances in the DI container.
 */
export const registerStorageBindings = (container: DependencyContainer) => {
  container.register<Storage>(POST_IMAGE_STORAGE, {
    useFactory: (c) =>
      new Storage({
        loggerRegistry: c.resolve(LoggerRegistry),
        minioClient: c.resolve(MinioClient),
        bucketName: 'post',
      }),
  });

  container.register<Storage>(PROFILE_IMAGE_STORAGE, {
    useFactory: (c) =>
      new Storage({
        loggerRegistry: c.resolve(LoggerRegistry),
        minioClient: c.resolve(MinioClient),
        bucketName: 'profile',
      }),
  });
};
