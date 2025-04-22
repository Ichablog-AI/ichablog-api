import KeyvRedis, { type RedisClientOptions } from '@keyv/redis';
import Keyv from 'keyv';
import { KeyvFile, type Options as KeyvFileOptions } from 'keyv-file';

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
 * @property options - Adapter-specific configuration options (RedisClientOptions or KeyvFileOptions).
 */
type CacheServiceParams = {
    type: CacheServiceAdapterType;
    options: RedisClientOptions | KeyvFileOptions;
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
     * Constructs a CacheService.
     *
     * @param params Optional adapter type and options.
     *               Defaults to Keyv in-memory adapter if omitted.
     */
    constructor(params?: Partial<CacheServiceParams>) {
        const { type, options } = params ?? {};
        let adapter: Keyv;
        // Configure adapter based on provided type and options
        if (type === 'redis' && options) {
            // Use Redis adapter if specified
            adapter = new Keyv(new KeyvRedis(options as RedisClientOptions));
        } else if (type === 'file' && options) {
            // Use file-based adapter if specified
            adapter = new Keyv({
                store: new KeyvFile(options as KeyvFileOptions),
            });
        } else {
            // Default to in-memory adapter if no type/options are provided or match
            adapter = new Keyv();
        }
        this.adapter = adapter;
    }

    /**
     * Retrieves a cached value by key.
     *
     * @param key Cache key.
     * @returns Cached value or undefined if not found.
     */
    async get<T>(key: string): Promise<T | undefined> {
        return this.adapter.get<T>(key);
    }

    /**
     * Sets a cache entry.
     *
     * @param key Cache key.
     * @param value Value to cache.
     * @param ttl Optional TTL in milliseconds.
     * @returns True if set was successful.
     */
    async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
        return this.adapter.set(key, value, ttl);
    }

    /**
     * Deletes a cache entry by key.
     *
     * @param key Cache key.
     * @returns True if the key existed and was deleted.
     */
    async delete(key: string): Promise<boolean> {
        return this.adapter.delete(key);
    }

    /**
     * Clears all cache entries.
     */
    async clear(): Promise<void> {
        return this.adapter.clear();
    }

    /**
     * Checks existence of a cache entry.
     *
     * @param key Cache key.
     * @returns True if the key exists.
     */
    async has(key: string): Promise<boolean> {
        return this.adapter.has(key);
    }

    /**
     * Retrieves a cached value or computes and caches it.
     *
     * @param key Cache key.
     * @param callback Function to compute the value if not cached.
     * @param ttl Optional TTL in milliseconds.
     * @returns Cached or computed value.
     */
    async remember<T>(key: string, callback: () => Promise<T> | T, ttl?: number): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== undefined) return cached;
        const result = await callback();
        await this.set<T>(key, result, ttl);
        return result;
    }
}
