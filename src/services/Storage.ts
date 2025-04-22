import type { LoggerRegistry } from '@be/services/LoggerRegistry';
import type { Client as MinioClient } from 'minio';
import type { Logger } from 'pino';

type StorageParams = {
    minioClient: MinioClient;
    bucketName: string;
    loggerRegistry: LoggerRegistry;
};

export interface UploadedObjectInfo {
    etag: string;
    versionId: string | null;
}

/**
 * Storage service for handling files in a MinIO bucket.
 * Provides methods to save, delete, and retrieve files with logging.
 */
export class Storage {
    protected client: MinioClient;
    protected bucket: string;
    protected logger: Logger;

    /**
     * Creates a new Storage service.
     * @param params - Storage initialization parameters.
     * @param params.minioClient - The MinIO client instance.
     * @param params.bucketName - The bucket name to operate on.
     * @param params.loggerRegistry - Logger registry to obtain loggers.
     */
    constructor({ minioClient, bucketName, loggerRegistry }: StorageParams) {
        this.client = minioClient;
        this.bucket = bucketName;
        this.logger = loggerRegistry.getLogger(`MinioClient/${bucketName}`);
    }

    /**
     * Saves a file to the bucket.
     * @param fileName - The destination file name in the bucket.
     * @param source - The file content as Buffer or path string.
     */
    async saveFile(
        fileName: string,
        source: Buffer | string
    ): Promise<UploadedObjectInfo> {
        this.logger.debug(`Saving file ${fileName} to bucket ${this.bucket}`);
        try {
            const response = Buffer.isBuffer(source)
                ? await this.client.putObject(this.bucket, fileName, source)
                : await this.client.fPutObject(this.bucket, fileName, source);
            this.logger.debug(
                response,
                `Successfully saved file ${fileName} to bucket ${this.bucket}`
            );
            return response;
        } catch (error) {
            this.logger.error(
                error,
                `Failed to save file ${fileName} to bucket ${this.bucket}`
            );
            throw error;
        }
    }

    /**
     * Deletes a file from the bucket.
     * @param fileName - The file name to delete.
     */
    async deleteFile(fileName: string): Promise<void> {
        this.logger.debug(
            `Deleting file ${fileName} from bucket ${this.bucket}`
        );
        try {
            await this.client.removeObject(this.bucket, fileName);
            this.logger.debug(
                `Successfully deleted file ${fileName} from bucket ${this.bucket}`
            );
        } catch (error) {
            this.logger.error(
                error,
                `Failed to delete file ${fileName} from bucket ${this.bucket}`
            );
            throw error;
        }
    }

    /**
     * Retrieves the content of a file as a Buffer.
     * @param fileName - The file name to retrieve.
     * @returns A Promise resolving to the file content as Buffer.
     */
    async getBuffer(fileName: string): Promise<Buffer> {
        this.logger.debug(
            `Retrieving file ${fileName} from bucket ${this.bucket}`
        );

        try {
            const stream = await this.client.getObject(this.bucket, fileName);
            const sink = new Bun.ArrayBufferSink();

            sink.start({
                asUint8Array: true,
            });

            for await (const chunk of stream as AsyncIterable<Uint8Array>) {
                sink.write(chunk);
            }

            const uint8 = sink.end() as Uint8Array;
            const result = Buffer.from(uint8);

            this.logger.debug(
                `Successfully retrieved file ${fileName} from bucket ${this.bucket}`
            );
            return result;
        } catch (error) {
            this.logger.error(
                error,
                `Failed to retrieve file ${fileName} from bucket ${this.bucket}`
            );
            throw error;
        }
    }
}
