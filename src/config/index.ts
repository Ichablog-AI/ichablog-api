import type { ClientOptions as MinioClientOptions } from 'minio';
const appConfig = {
  nodeEnv: Bun.env.NODE_ENV ?? 'development',
  port: Number(Bun.env.PORT) || 3000,

  databaseUrl: Bun.env.DATABASE_URL ?? '',

  jwtSecret: Bun.env.JWT_SECRET ?? '',

  meilisearch: {
    host: Bun.env.MEILISEARCH_HOST ?? 'http://127.0.0.1:7700',
    apiKey: Bun.env.MEILISEARCH_API_KEY ?? '',
  },

  redisUrl: Bun.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
  logger: {
    level: String(Bun.env.LOGGER_LEVEL ?? 'info'),
  },
  minio: {
    clientOptions: {
      useSSL:
        String(Bun.env.MINIO_USE_SSL) === 'true' ||
        Number(Bun.env.MINIO_USE_SSL) === 1,
      endPoint: String(Bun.env.MINIO_ENDPOINT ?? '127.0.0.1'),
      port: Number(Bun.env.MINIO_PORT || 9000),
      accessKey: String(Bun.env.MINIO_ACCESS_KEY ?? 'ichablog'),
      secretKey: String(Bun.env.MINIO_SECRET_KEY ?? 'ichablog'),
    } as MinioClientOptions,
  },
};

export type AppConfig = typeof appConfig;
export default appConfig;
