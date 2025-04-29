import { appContainer } from '@be/config/container';
import { AppDataSource } from '@be/database/data-source';
import { MailService } from '@be/email/MailService';
import { CacheService } from '@be/services/CacheService';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { Hono } from 'hono';
import { MeiliSearch } from 'meilisearch';
import { Client as MinioClient } from 'minio';

const health = new Hono();
const logger = appContainer.resolve(LoggerRegistry).getLogger('HealthCheck');
const cacheService = appContainer.resolve(CacheService);
const storageClient = appContainer.resolve(MinioClient);
const searchClient = appContainer.resolve(MeiliSearch);
const mailService = appContainer.resolve(MailService);

/**
 * Helper: reject if `promise` doesn’t settle within `ms` milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, name: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            logger.error({ name, ms }, `Timeout after ${ms}ms`);
            reject(new Error(`${name} timeout`));
        }, ms);

        promise
            .then((val) => {
                clearTimeout(timer);
                logger.debug({ name, val }, `${name} succeeded`);
                resolve(val);
            })
            .catch((err) => {
                clearTimeout(timer);
                logger.error({ name, err }, `${name} error`);
                reject(err);
            });
    });
}

const checkDbStatus = async (): Promise<boolean> => {
    logger.debug('Checking database status');
    return AppDataSource.isInitialized;
};

const checkCacheStatus = async (): Promise<boolean> => {
    const key = `__health__:${Date.now()}`;
    logger.debug({ key }, 'Setting health key in cache');
    await cacheService.set(key, '1', 1000);
    logger.debug({ key }, 'Checking health key in cache');
    return cacheService.has(key);
};

const checkStorageStatus = async (): Promise<boolean> => {
    logger.debug('Listing MinIO buckets');
    const buckets = await storageClient.listBuckets();
    logger.debug({ bucketCount: buckets.length }, 'MinIO bucket list retrieved');
    return buckets.length > 0;
};

const checkSearchStatus = async (): Promise<boolean> => {
    logger.debug('Checking Meilisearch status');
    const { status } = await searchClient.health();
    logger.info({ status }, 'Meilisearch health check result');
    return status === 'available';
};

const checkMailServiceStatus = async (): Promise<boolean> => {
    logger.debug('Checking MailService status');
    const status = await mailService.transporter.verify();
    logger.info({ status }, 'MailService health check result');
    return status;
};

health.get('/', async (c) => {
    logger.info('Starting health checks');

    const dbPromise = withTimeout(checkDbStatus(), 500, 'DB');
    const cachePromise = withTimeout(checkCacheStatus(), 500, 'Cache');
    const storagePromise = withTimeout(checkStorageStatus(), 500, 'Storage');
    const searchPromise = withTimeout(checkSearchStatus(), 500, 'Search');
    const mailPromise = withTimeout(checkMailServiceStatus(), 500, 'Search');

    const results = await Promise.allSettled([dbPromise, cachePromise, storagePromise, searchPromise, mailPromise]);
    const [dbRes, cacheRes, storageRes, searchRes, mailRes] = results;

    const database = dbRes.status === 'fulfilled' && dbRes.value === true;
    const cache = cacheRes.status === 'fulfilled' && cacheRes.value === true;
    const storage = storageRes.status === 'fulfilled' && storageRes.value === true;
    const search = searchRes.status === 'fulfilled' && searchRes.value === true;
    const mail = mailRes.status === 'fulfilled' && mailRes.value === true;

    logger.info('Health check results', {
        database,
        cache,
        storage,
        search,
        mail,
        raw: { dbRes, cacheRes, storageRes, search, mail },
    });

    const allOK = database && cache && storage && search && mail;

    return c.json(
        {
            status: allOK ? 'ok' : 'error',
            checks: {
                database: database ? 'connected' : 'disconnected',
                cache: cache ? 'connected' : 'disconnected',
                storage: storage ? 'connected' : 'disconnected',
                search: search ? 'connected' : 'disconnected',
                mail: mail ? 'connected' : 'disconnected',
            },
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
        allOK ? 200 : 503
    );
});

export default health;
