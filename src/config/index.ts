import type { Config as MeiliSearchConfig } from 'meilisearch';
import type { ClientOptions as MinioClientOptions } from 'minio';

const appConfig = {
    nodeEnv: Bun.env.NODE_ENV ?? 'development',
    port: Number(Bun.env.PORT) || 3000,

    databaseUrl: Bun.env.DATABASE_URL ?? '',

    jwtSecret: Bun.env.JWT_SECRET ?? '',

    redisUrl: Bun.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
    logger: {
        level: String(Bun.env.LOGGER_LEVEL ?? 'info'),
    },
    minio: {
        clientOptions: {
            useSSL: String(Bun.env.MINIO_USE_SSL) === 'true' || Number(Bun.env.MINIO_USE_SSL) === 1,
            endPoint: String(Bun.env.MINIO_ENDPOINT ?? '127.0.0.1'),
            port: Number(Bun.env.MINIO_PORT || 9000),
            accessKey: String(Bun.env.MINIO_ACCESS_KEY ?? 'ichablog'),
            secretKey: String(Bun.env.MINIO_SECRET_KEY ?? 'ichablog'),
        } as MinioClientOptions,
    },
    cache: {
        type: String(Bun.env.CACHE_DRIVER ?? 'file'),
        options: {
            url: String(Bun.env.CACHE_URL ?? './cache.db'),
        },
    },
    meilisearch: {
        clientOptions: {
            host: String(Bun.env.MEILISEARCH_HOST ?? 'http://meilisearch:7700'),
            apiKey: String(Bun.env.MEILISEARCH_API_KEY ?? 'masterKey'),
        } as MeiliSearchConfig,
    },
};

export type AppConfig = typeof appConfig;
export default appConfig;
