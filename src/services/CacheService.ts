import type { LoggerRegistry } from '@be/services/LoggerRegistry';
import KeyvRedis, { type RedisClientOptions } from '@keyv/redis';
import Keyv from 'keyv';
import { KeyvFile, type Options as KeyvFileOptions } from 'keyv-file';
import type { Logger } from 'pino';

/**
 * Types of cache adapter backends supported by CacheService.
 *
 * - 'file': In-memory file-based storage adapter (KeyvFile).
 * - 'redis': Redis backend adapter via KeyvRedis.
 */
type CacheServiceAdapterType = 'file' | 'redis';

/**
 * Configuration parameters for CacheService construction.
 *
 * @property type - The type of cache adapter to use ('file' or 'redis').
 * @property options - Adapter-specific configuration options. For Redis, refer to RedisClientOptions; for file, refer to KeyvFileOptions.
 * @property loggerRegistry - The logger registry instance for creating loggers. This is a required parameter.
 */
export type CacheServiceParams = {
    type: CacheServiceAdapterType;
    options: RedisClientOptions | KeyvFileOptions;
    loggerRegistry: LoggerRegistry; // No longer optional
};

/**
 * Provides a caching service supporting multiple backends (Redis or file) via Keyv.
 * Supports typical cache operations and a helper remember method.
 */
export class CacheService {
    /**
     * The underlying Keyv instance managing cache storage.
     */
    protected adapter: Keyv;
    /**
     * Logger instance for CacheService.
     */
    protected logger: Logger; // No longer optional

    /**
     * Constructs a CacheService.
     *
     * @param params - Adapter type, options, and logger registry. All parameters are required.
     */
    constructor(params: CacheServiceParams) {
        // params is now required
        const { type, options, loggerRegistry } = params; // Destructure directly
        let adapter: Keyv;
        if (type === 'redis' && options) {
            adapter = new Keyv(new KeyvRedis(options as RedisClientOptions));
        } else if (type === 'file' && options) {
            adapter = new Keyv({
                store: new KeyvFile(options as KeyvFileOptions),
            });
        } else {
            // Default to in-memory adapter if type/options don't match
            // Note: You might want to reconsider this default if params are required
            // or ensure 'type' and 'options' are handled appropriately when required.
            adapter = new Keyv();
        }
        this.adapter = adapter;
        this.logger = loggerRegistry.getLogger('CacheService'); // Set the logger directly
    }

    /**
     * Retrieves a cached value by key.
     *
     * @param key - Cache key.
     * @returns Cached value or undefined if not found. Logs an error if the retrieval fails.
     */
    async get<T>(key: string): Promise<T | undefined> {
        try {
            const value = await this.adapter.get<T>(key);
            this.logger.debug({ key, value }, 'Cache get'); // logger is always defined
            return value;
        } catch (error) {
            this.logger.error(error, `Cache get failed for key: ${key}`); // logger is always defined
            throw error;
        }
    }

    /**
     * Sets a cache entry.
     *
     * @param key - Cache key.
     * @param value - Value to cache.
     * @param ttl - Optional TTL in milliseconds.
     * @returns True if set was successful; false if the operation failed (e.g., due to invalid parameters).
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
        try {
            const result = await this.adapter.set(key, value, ttl);
            this.logger.debug({ key, value, ttl }, 'Cache set'); // logger is always defined
            return result;
        } catch (error) {
            this.logger.error(error, `Cache set failed for key: ${key}`); // logger is always defined
            throw error;
        }
    }

    /**
     * Deletes a cache entry by key.
     *
     * @param key - Cache key.
     * @returns True if the key existed and was deleted; false if the key did not exist.
     */
    async delete(key: string): Promise<boolean> {
        try {
            const result = await this.adapter.delete(key);
            this.logger.debug({ key, result }, 'Cache delete'); // Added logging
            return result;
        } catch (error) {
            this.logger.error(error, `Cache delete failed for key: ${key}`); // Added logging
            throw error;
        }
    }

    /**
     * Clears all cache entries.
     *
     * Logs success or failure of the operation.
     */
    async clear(): Promise<void> {
        try {
            await this.adapter.clear();
            this.logger.debug('Cache cleared'); // Added logging
        } catch (error) {
            this.logger.error(error, 'Cache clear failed'); // Added logging
            throw error;
        }
    }

    /**
     * Checks existence of a cache entry.
     *
     * @param key - Cache key.
     * @returns True if the key exists; false otherwise.
     */
    async has(key: string): Promise<boolean> {
        try {
            const result = await this.adapter.has(key);
            this.logger.debug({ key, result }, 'Cache has'); // Added logging
            return result;
        } catch (error) {
            this.logger.error(error, `Cache has check failed for key: ${key}`); // Added logging
            throw error;
        }
    }

    /**
     * Retrieves a cached value or computes and caches it.
     *
     * @param key - Cache key.
     * @param callback - Function to compute the value if not cached.
     * @param ttl - Optional TTL in milliseconds.
     * @returns Cached or computed value. Logs errors if operations fail.
     */
    async remember<T>(key: string, callback: () => Promise<T> | T, ttl?: number): Promise<T> {
        try {
            // Use existing get method which already has logging
            const cached = await this.get<T>(key);
            if (cached !== undefined) {
                this.logger.debug({ key, cacheHit: true }, 'Cache remember (hit)'); // Added logging
                return cached;
            }

            this.logger.debug({ key, cacheHit: false }, 'Cache remember (miss)'); // Added logging
            const result = await callback();
            // Use existing set method which already has logging
            await this.set<T>(key, result, ttl);
            return result;
        } catch (error) {
            // Errors from get/set are already logged within those methods.
            // Log specifically for the remember operation context if needed.
            this.logger.error(error, `Cache remember failed for key: ${key}`); // Added logging for remember context
            throw error; // Re-throw the error caught from get/set or callback
        }
    }
}
