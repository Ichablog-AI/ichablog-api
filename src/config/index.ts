import type { Config as MeiliSearchConfig } from 'meilisearch';
import type { ClientOptions as MinioClientOptions } from 'minio';
import type { DataSourceOptions } from 'typeorm';

const appConfig = {
    nodeEnv: Bun.env.NODE_ENV ?? 'development',
    jwtSecret: Bun.env.JWT_SECRET ?? '',
    logger: {
        level: String(Bun.env.LOGGER_LEVEL ?? 'info'),
    },
    minio: {
        clientOptions: {
            useSSL: String(Bun.env.MINIO_USE_SSL) === 'true' || Number(Bun.env.MINIO_USE_SSL) === 1,
            endPoint: String(Bun.env.MINIO_ENDPOINT ?? 'minio'),
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
            url: Bun.env.DATABASE_URL ?? 'mysql://ichablog:ichablog@mariadb:3306/ichablog',
            synchronize: false,
            logging: false,
            entities: [`${import.meta.dir}/../entities/*.ts`],
            migrations: [`${import.meta.dir}/migrations/**/*.ts`],
        } as DataSourceOptions,
    },
    httpServer: {
        port: Number(Bun.env.PORT ?? 3000),
        host: String(Bun.env.HOST ?? '0.0.0.0'),
        protocol: String(Bun.env.PROTOCOL ?? 'http'),
    },
    queue: {
        redisUrl: String(Bun.env.REDIS_URL ?? 'redis://redis:6379'),
    },
    mail: {
        from: String(Bun.env.MAIL_FROM ?? 'IchaBlog App <no-reply@example.ichablog.com>'),
        smtp: {
            host: String(Bun.env.SMTP_HOST ?? 'mailhog'),
            port: Number(Bun.env.SMTP_PORT ?? 1025),
            secure: String(Bun.env.SMTP_SECURE) === 'true' || Number(Bun.env.SMTP_SECURE) === 1,
            auth: Bun.env.SMTP_USER
                ? {
                      user: Bun.env.SMTP_USER,
                      pass: Bun.env.SMTP_PASS,
                  }
                : undefined,
        },
    },
};

export type AppConfig = typeof appConfig;
export default appConfig;
