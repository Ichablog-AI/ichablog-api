import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import { Readable } from 'node:stream';
import { Storage } from '@be/services/Storage';
import { createMockLogger, createMockLoggerRegistry } from '@be/test-mocks/MockedLoggerRegistry';
import { createMockMinioClient } from '@be/test-mocks/MockedMinioClient';

// Helper to create Storage instance with mocks and access to logger and client
function createStorage() {
    const mockLogger = createMockLogger();
    const loggerRegistry = createMockLoggerRegistry(mockLogger);
    const minioClient = createMockMinioClient();
    return {
        instance: new Storage({
            minioClient,
            bucketName: 'test-bucket',
            loggerRegistry,
        }),
        minioClient,
        loggerRegistry,
        mockLogger,
    };
}

// Helper to create mocked Readable stream for getBuffer tests
function createMockReadableStream(
    chunks: Uint8Array[],
    shouldThrow = false,
    error: Error = new Error('Mock stream error')
): Readable {
    if (shouldThrow) {
        return new Readable({
            read() {
                this.destroy(error);
            },
        });
    }

    return Readable.from(chunks);
}
describe('Storage', () => {
    afterEach(() => {
        // resetAllMocks is bun test internal, fallback to manual reset
        // @ts-ignore
        globalThis.__mock?.resetAllMocks?.();
    });

    it('should create Storage instance and get logger from registry', () => {
        const { instance, loggerRegistry } = createStorage();
        expect(instance).toBeInstanceOf(Storage);
        expect(loggerRegistry.getLogger).toHaveBeenCalledTimes(1);
        expect(loggerRegistry.getLogger).toHaveBeenCalledWith('MinioClient/test-bucket');
    });

    describe('saveFile', () => {
        it('should save file when source is Buffer and return UploadedObjectInfo', async () => {
            const { instance, minioClient, mockLogger } = createStorage();
            const fakeResponse = { etag: 'abc123', versionId: null };
            spyOn(minioClient, 'putObject').mockResolvedValue(fakeResponse);
            const fileName = 'file-buffer.txt';
            const content = Buffer.from('test data');

            const result = await instance.saveFile(fileName, content);

            expect(minioClient.putObject).toHaveBeenCalledTimes(1);
            expect(minioClient.putObject).toHaveBeenCalledWith('test-bucket', fileName, content);
            expect(result).toEqual(fakeResponse);
            expect(mockLogger.debug).toHaveBeenCalledWith(`Saving file ${fileName} to bucket test-bucket`);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                fakeResponse,
                `Successfully saved file ${fileName} to bucket test-bucket`
            );
        });

        it('should save file when source is string (path) and return UploadedObjectInfo', async () => {
            const { instance, minioClient, mockLogger } = createStorage();
            const fakeResponse = { etag: 'def456', versionId: 'v1' };
            spyOn(minioClient, 'fPutObject').mockResolvedValue(fakeResponse);
            const fileName = 'file-path.txt';
            const filePath = '/tmp/file.txt';

            const result = await instance.saveFile(fileName, filePath);

            expect(minioClient.fPutObject).toHaveBeenCalledTimes(1);
            expect(minioClient.fPutObject).toHaveBeenCalledWith('test-bucket', fileName, filePath);
            expect(result).toEqual(fakeResponse);
            expect(mockLogger.debug).toHaveBeenCalledWith(`Saving file ${fileName} to bucket test-bucket`);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                fakeResponse,
                `Successfully saved file ${fileName} to bucket test-bucket`
            );
        });

        it('should log and throw on putObject error', () => {
            const { instance, minioClient, mockLogger } = createStorage();
            const err = new Error('putObject error');
            spyOn(minioClient, 'putObject').mockRejectedValue(err);
            const fileName = 'file-buffer-error.txt';
            const content = Buffer.from('bad content');

            expect(instance.saveFile(fileName, content)).rejects.toThrowError(err);
            expect(mockLogger.error).toHaveBeenCalledWith(err, `Failed to save file ${fileName} to bucket test-bucket`);
        });
    });

    describe('deleteFile', () => {
        it('should delete file successfully', async () => {
            const { instance, minioClient, mockLogger } = createStorage();
            spyOn(minioClient, 'removeObject').mockResolvedValue(undefined);
            const fileName = 'file-to-delete.txt';

            await instance.deleteFile(fileName);

            expect(minioClient.removeObject).toHaveBeenCalledTimes(1);
            expect(minioClient.removeObject).toHaveBeenCalledWith('test-bucket', fileName);
            expect(mockLogger.debug).toHaveBeenCalledWith(`Deleting file ${fileName} from bucket test-bucket`);
            expect(mockLogger.debug).toHaveBeenCalledWith(
                `Successfully deleted file ${fileName} from bucket test-bucket`
            );
        });

        it('should log and throw on removeObject error', () => {
            const { instance, minioClient, mockLogger } = createStorage();
            const err = new Error('removeObject error');
            spyOn(minioClient, 'removeObject').mockRejectedValue(err);
            const fileName = 'file-delete-error.txt';

            expect(instance.deleteFile(fileName)).rejects.toThrowError(err);
            expect(mockLogger.error).toHaveBeenCalledWith(
                err,
                `Failed to delete file ${fileName} from bucket test-bucket`
            );
        });
    });

    describe('getBuffer', () => {
        it('should retrieve and concatenate buffer data from stream', async () => {
            const { instance, minioClient, mockLogger } = createStorage();
            const stream = createMockReadableStream([
                new Uint8Array(Buffer.from('hello ')),
                new Uint8Array(Buffer.from('world')),
            ]);

            spyOn(minioClient, 'getObject').mockResolvedValue(stream);

            const result = await instance.getBuffer('file-buffer.txt');

            expect(result.toString()).toBe('hello world');
            expect(mockLogger.debug).toHaveBeenCalledWith('Retrieving file file-buffer.txt from bucket test-bucket');
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'Successfully retrieved file file-buffer.txt from bucket test-bucket'
            );
        });

        it('should log and reject on stream error', async () => {
            const { instance, minioClient, mockLogger } = createStorage();
            const error = new Error('stream failure');
            const stream = createMockReadableStream([], true, error);

            spyOn(minioClient, 'getObject').mockResolvedValue(stream);

            expect(instance.getBuffer('file-error.txt')).rejects.toThrow('stream failure');
            expect(mockLogger.error).toHaveBeenCalledWith(
                error,
                'Failed to retrieve file file-error.txt from bucket test-bucket'
            );
        });

        it('should catch and log error when getObject fails', async () => {
            const { instance, minioClient, mockLogger } = createStorage();
            const error = new Error('getObject failure');
            spyOn(minioClient, 'getObject').mockRejectedValue(error);

            expect(instance.getBuffer('file-get-error.txt')).rejects.toThrow(error);
            expect(mockLogger.error).toHaveBeenCalledWith(
                error,
                'Failed to retrieve file file-get-error.txt from bucket test-bucket'
            );
        });
    });
});
