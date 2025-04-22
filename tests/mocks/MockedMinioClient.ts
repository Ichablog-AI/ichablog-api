import { mock } from 'bun:test';
import type { Client as MinioClient } from 'minio';

/**
 * Creates a reusable mock MinioClient instance.
 * @returns {MinioClient} A mock Minio client.
 */
export function createMockMinioClient(): MinioClient {
  return {
    putObject: mock(),
    fPutObject: mock(),
    getObject: mock(),
    removeObject: mock(),
    listObjectsV2: mock(),
    listBuckets: mock(),
    makeBucket: mock(),
    bucketExists: mock(),
    removeBucket: mock(),
    // Add other MinIO Client methods you use here with mock()
  } as unknown as MinioClient;
}
