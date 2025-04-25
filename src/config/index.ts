import type { Config as MeiliSearchConfig } from 'meilisearch';
import type { ClientOptions as MinioClientOptions } from 'minio';
import type { DataSourceOptions } from 'typeorm';

const appConfig = {
    nodeEnv: Bun.env.NODE_ENV ?? 'development',
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
    database: {
        db: {
            type: 'mariadb',
            driver: require('mysql2'),
            url: Bun.env.DATABASE_URL ?? 'mysql://@127.0.0.1:3306/ichablog',
            synchronize: false,
            logging: false,
            entities: [`${import.meta.dir}/../entities/*.ts`],
            migrations: [`${import.meta.dir}/migrations/**/*.ts`],
        } as DataSourceOptions,
    },
    httpServer: {
        port: Number(Bun.env.PORT ?? 3000),
        host: String(Bun.env.HOST ?? '127.0.0.1'),
        protocol: String(Bun.env.PROTOCOL ?? 'http'),
    },
};

export type AppConfig = typeof appConfig;
export default appConfig;
