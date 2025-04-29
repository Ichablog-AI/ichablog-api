import { describe, expect, it } from 'bun:test';
import { appContainer } from '@be/config/container';
import { POST_IMAGE_STORAGE, PROFILE_IMAGE_STORAGE } from '@be/config/container/storage';
import { MailService } from '@be/email/MailService';
import { HelloWorldJob } from '@be/jobs/HelloWorldJob';
import { SharedQueue } from '@be/resque/SharedQueue';
import { CacheService } from '@be/services/CacheService';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { SearchService } from '@be/services/SearchService';
import { Storage } from '@be/services/Storage';
import { POST_SEARCH_SERVICE } from '@be/types/search/PostSearch';
import Redis from 'ioredis';
import { MeiliSearch } from 'meilisearch';
import * as minio from 'minio';
import type { InjectionToken } from 'tsyringe';

describe('DI registration', () => {
    it.each([
        [LoggerRegistry, LoggerRegistry],
        [minio.Client, minio.Client],
        [POST_IMAGE_STORAGE, Storage],
        [PROFILE_IMAGE_STORAGE, Storage],
        [CacheService, CacheService],
        [MeiliSearch, MeiliSearch],
        [POST_SEARCH_SERVICE, SearchService],
        [Redis, Redis],
        [SharedQueue, SharedQueue],
        [HelloWorldJob, HelloWorldJob],
        [MailService, MailService],
    ])('should resolve %p with an instance of %p', (token, instanceType) => {
        const instance = appContainer.resolve(token as InjectionToken);
        expect(instance).toBeInstanceOf(instanceType);
    });
});
