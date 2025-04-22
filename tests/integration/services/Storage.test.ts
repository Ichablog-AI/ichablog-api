import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import appConfig from '@be/config';
import { Storage } from '@be/services/Storage';
import { createMockLoggerRegistry } from '@be/test-mocks/MockedLoggerRegistry';
import { Client as MinioClient } from 'minio';

const BUCKET_NAME = 'integration-test-bucket';
const FILE_NAME = 'test-file.txt';
const FILE_CONTENT = 'Hello from integration test!';
const TMP_PATH = join(import.meta.dir, 'temp-file.txt');

describe('Storage (integration)', () => {
  let storage: Storage;
  let client: MinioClient;

  beforeAll(async () => {
    client = new MinioClient({
      ...appConfig.minio.clientOptions,
      region: '',
    });
    // Make sure the bucket exists
    const exists = await client.bucketExists(BUCKET_NAME);
    if (!exists) {
      await client.makeBucket(BUCKET_NAME);
    }

    const loggerRegistry = createMockLoggerRegistry();
    storage = new Storage({
      minioClient: client,
      bucketName: BUCKET_NAME,
      loggerRegistry,
    });

    // Prepare file on disk for fPutObject test
    await writeFile(TMP_PATH, FILE_CONTENT);
  });

  afterAll(async () => {
    try {
      await client.removeObject(BUCKET_NAME, FILE_NAME);
    } catch {}
    try {
      await unlink(TMP_PATH);
    } catch {}
  });

  it('should save and retrieve file via Buffer', async () => {
    await storage.saveFile(FILE_NAME, Buffer.from(FILE_CONTENT));

    const result = await storage.getBuffer(FILE_NAME);
    expect(result.toString()).toBe(FILE_CONTENT);
  });

  it('should save and retrieve file via file path', async () => {
    await storage.saveFile(FILE_NAME, TMP_PATH);

    const result = await storage.getBuffer(FILE_NAME);
    expect(result.toString()).toBe(FILE_CONTENT);
  });

  it('should delete a file successfully', async () => {
    await storage.saveFile(FILE_NAME, Buffer.from(FILE_CONTENT));
    await storage.deleteFile(FILE_NAME);

    expect(storage.getBuffer(FILE_NAME)).rejects.toThrow();
  });
});
