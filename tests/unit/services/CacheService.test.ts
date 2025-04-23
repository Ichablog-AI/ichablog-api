import { afterEach, beforeEach, describe, expect, it, jest, mock, setSystemTime, spyOn } from 'bun:test';
import { CacheService } from '@be/services/CacheService';
import type { LoggerRegistry } from '@be/services/LoggerRegistry';
import { createMockLogger, createMockLoggerRegistry } from '@be/test-mocks/MockedLoggerRegistry';
import Keyv from 'keyv';
import type { Logger } from 'pino';

class CacheServiceExposedAdapter extends CacheService {
    public adapter: Keyv = new Keyv();
}

describe('CacheService', () => {
    let cacheService: CacheServiceExposedAdapter;
    let mockLoggerRegistry: LoggerRegistry;
    let mockLogger: Logger;
    let initialTime: number;

    beforeEach(async () => {
        mockLogger = createMockLogger();
        mockLoggerRegistry = createMockLoggerRegistry(mockLogger);
        cacheService = new CacheServiceExposedAdapter({
            type: 'memory',
            options: {},
            loggerRegistry: mockLoggerRegistry,
        });

        // Set initial fake time for consistency
        initialTime = Date.now();
        setSystemTime(initialTime);

        // Clear mocks before each test
        jest.clearAllMocks();

        // Clear the actual cache before each test
        await cacheService.clear();
    });

    // Restore any prototype spies and fake timers after each test
    afterEach(() => {
        jest.restoreAllMocks();
        setSystemTime();
    });

    it('should correctly perform basic cache operations', async () => {
        // Test set and get
        expect(cacheService.set('key1', 'value1', 1000)).resolves.toBe(true);
        expect(cacheService.get('key1')).resolves.toBe('value1');

        // Test has
        expect(cacheService.has('key1')).resolves.toBe(true);
        expect(cacheService.has('nonexistent')).resolves.toBe(false);

        // Test delete
        expect(cacheService.delete('key1')).resolves.toBe(true);
        expect(cacheService.has('key1')).resolves.toBe(false);
        expect(cacheService.get('key1')).resolves.toBeUndefined();
        expect(cacheService.delete('nonexistent')).resolves.toBe(false); // Key doesn't exist

        // Test clear
        await cacheService.set('key2', 'value2');
        await cacheService.set('key3', 'value3');
        await cacheService.clear();
        expect(cacheService.has('key2')).resolves.toBe(false);
        expect(cacheService.has('key3')).resolves.toBe(false);
    });

    it('should use cached value in remember', async () => {
        // Set an initial value
        await cacheService.set('rememberKey', 'cachedValue');

        // Create a callback function (using spyOn to track calls)
        const callback = mock().mockResolvedValue('newValue');

        // Call remember - should return the cached value
        const result = await cacheService.remember('rememberKey', callback);

        expect(result).toBe('cachedValue');
        // Verify the callback was NOT called because the value was cached
        expect(callback).not.toHaveBeenCalled();
        // Verify the cached value is still the same
        expect(cacheService.get('rememberKey')).resolves.toBe('cachedValue');
    });

    it('should call callback and cache result in remember if no cached value', async () => {
        // Ensure the key does not exist initially (cleared in beforeEach)
        expect(cacheService.has('newRememberKey')).resolves.toBe(false);

        // Create a callback function (using spyOn to track calls)
        const callback = mock().mockResolvedValue('freshValue');

        // Call remember - should execute the callback and cache the result
        const result = await cacheService.remember('newRememberKey', callback, 5000);

        // Verify the callback was called
        expect(callback).toHaveBeenCalledTimes(1);
        // Verify the result is the value returned by the callback
        expect(result).toBe('freshValue');
        // Verify the value was cached
        expect(cacheService.get('newRememberKey')).resolves.toBe('freshValue');
    });

    it('should expire cache entry after TTL (set)', async () => {
        const key = 'ttlKeySet';
        const value = 'ttlValue';
        const ttl = 100; // 100 ms

        await cacheService.set(key, value, ttl);
        expect(cacheService.get(key)).resolves.toBe(value);

        // Advance time beyond TTL using the directly imported setSystemTime
        setSystemTime(initialTime + ttl + 1);

        // Now the key should be expired
        expect(cacheService.get(key)).resolves.toBeUndefined();
        expect(cacheService.has(key)).resolves.toBe(false);
    });

    it('should expire cache entry after TTL (remember)', async () => {
        const key = 'ttlKeyRemember';
        const value = 'rememberedValue';
        const ttl = 150; // 150 ms
        const callback = mock().mockResolvedValue(value);

        // First call, caches the value (uses initialTime from beforeEach)
        await cacheService.remember(key, callback, ttl);
        expect(cacheService.get(key)).resolves.toBe(value);
        expect(callback).toHaveBeenCalledTimes(1);

        // Advance time, but still within TTL (uses initialTime from beforeEach)
        setSystemTime(initialTime + ttl - 50);
        expect(cacheService.get(key)).resolves.toBe(value); // Should still exist

        // Advance time beyond TTL (uses initialTime from beforeEach)
        setSystemTime(initialTime + ttl + 50);

        // Now the key should be expired, remember should call callback again
        const secondResult = await cacheService.remember(key, callback, ttl);
        expect(secondResult).toBe(value);
        expect(callback).toHaveBeenCalledTimes(2); // Called again
        expect(cacheService.get(key)).resolves.toBe(value); // Re-cached
    });

    it('should handle different data types', async () => {
        const keyObject = 'objectKey';
        const valueObject = { a: 1, b: 'test' };
        const keyNumber = 'numberKey';
        const valueNumber = 123;
        const keyBoolean = 'booleanKey';
        const valueBoolean = true;

        await cacheService.set(keyObject, valueObject);
        await cacheService.set(keyNumber, valueNumber);
        await cacheService.set(keyBoolean, valueBoolean);

        expect(cacheService.get(keyObject)).resolves.toEqual(valueObject);
        expect(cacheService.get(keyNumber)).resolves.toBe(valueNumber);
        expect(cacheService.get(keyBoolean)).resolves.toBe(valueBoolean);
    });

    it('should log and throw error on adapter get failure', async () => {
        const key = 'errorGetKey';
        const error = new Error('Adapter get failed');
        spyOn(cacheService.adapter, 'get').mockRejectedValue(error);

        expect(cacheService.get(key)).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), `Cache get failed for key: ${key}`);
    });

    it('should log and throw error on adapter set failure', async () => {
        const key = 'errorSetKey';
        const value = 'errorValue';
        const error = new Error('Adapter set failed');
        spyOn(cacheService.adapter, 'set').mockRejectedValue(error);

        expect(cacheService.set(key, value)).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), `Cache set failed for key: ${key}`);
    });

    it('should log and throw error on adapter delete failure', async () => {
        const key = 'errorDeleteKey';
        const error = new Error('Adapter delete failed');
        // Set a value first so delete has something to target (conceptually)
        await cacheService.set(key, 'valueToDelete');

        spyOn(cacheService.adapter, 'delete').mockRejectedValue(error);

        expect(cacheService.delete(key)).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), `Cache delete failed for key: ${key}`);
    });

    it('should log and throw error on adapter clear failure', async () => {
        const error = new Error('Adapter clear failed');
        spyOn(cacheService.adapter, 'clear').mockRejectedValue(error);

        expect(cacheService.clear()).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), 'Cache clear failed');
    });

    it('should log and throw error on adapter has failure', async () => {
        const key = 'errorHasKey';
        const error = new Error('Adapter has failed');
        spyOn(cacheService.adapter, 'has').mockRejectedValue(error);

        expect(cacheService.has(key)).rejects.toThrow(error);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), `Cache has check failed for key: ${key}`);
    });

    it('should log and throw error on remember callback failure', async () => {
        const key = 'errorRememberCallback';
        const error = new Error('Callback failed');
        const callback = mock().mockRejectedValue(error);

        const setSpy = spyOn(cacheService.adapter, 'set');

        expect(cacheService.remember(key, callback)).rejects.toThrow(error);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), `Cache remember failed for key: ${key}`);
        // Ensure set was not called because callback failed
        expect(setSpy).not.toHaveBeenCalled();
    });

    it('should log and throw error on remember get failure', async () => {
        const key = 'errorRememberGet';
        const error = new Error('Adapter get failed during remember');
        const callback = mock().mockResolvedValue('should not be called');
        // Spy on prototype get to simulate failure
        spyOn(cacheService.adapter, 'get').mockRejectedValue(error);

        expect(cacheService.remember(key, callback)).rejects.toThrow(error);
        expect(callback).not.toHaveBeenCalled();
        // Check that the error log contains the key
        expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error), expect.stringContaining(`key: ${key}`));
    });
});
