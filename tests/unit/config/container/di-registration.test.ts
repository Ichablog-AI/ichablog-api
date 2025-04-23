import { describe, expect, it } from 'bun:test';
import { appContainer } from '@be/config/container';
import { POST_IMAGE_STORAGE, PROFILE_IMAGE_STORAGE } from '@be/config/container/storage';
import { CacheService } from '@be/services/CacheService';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { Storage } from '@be/services/Storage';
import * as minio from 'minio';
import type { InjectionToken } from 'tsyringe';
describe('DI registration', () => {
    it.each([
        [LoggerRegistry, LoggerRegistry],
        [minio.Client, minio.Client],
        [POST_IMAGE_STORAGE, Storage],
        [PROFILE_IMAGE_STORAGE, Storage],
        [CacheService, CacheService],
    ])('should resolve %p with an instance of %p', (token, instanceType) => {
        const instance = appContainer.resolve(token as InjectionToken);
        expect(instance).toBeInstanceOf(instanceType);
    });
});
