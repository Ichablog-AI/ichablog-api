const config = {
  nodeEnv: Bun.env.NODE_ENV ?? 'development',
  port: Number(Bun.env.PORT) || 3000,

  databaseUrl: Bun.env.DATABASE_URL ?? '',

  jwtSecret: Bun.env.JWT_SECRET ?? '',

  minio: {
    endpoint: Bun.env.MINIO_ENDPOINT ?? '127.0.0.1',
    port: Number(Bun.env.MINIO_PORT) || 9000,
    accessKey: Bun.env.MINIO_ACCESS_KEY ?? '',
    secretKey: Bun.env.MINIO_SECRET_KEY ?? '',
  },

  meilisearch: {
    host: Bun.env.MEILISEARCH_HOST ?? 'http://127.0.0.1:7700',
    apiKey: Bun.env.MEILISEARCH_API_KEY ?? '',
  },

  redisUrl: Bun.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
  logger: {
    level: String(Bun.env.LOGGER_LEVEL ?? 'info'),
  },
};

export type AppConfig = typeof config;
export default config;
