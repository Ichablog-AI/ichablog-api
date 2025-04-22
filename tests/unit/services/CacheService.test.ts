import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { CacheService } from '@be/services/CacheService';

describe('CacheService', () => {
    let cacheService: CacheService;

    beforeEach(async () => {
        // Initialize CacheService before each test (uses default in-memory adapter)
        cacheService = new CacheService();
        // Clear cache before each test to ensure isolation
        await cacheService.clear();
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
        const callbackImplementation = { fn: async () => 'newValue' };
        const callbackSpy = spyOn(callbackImplementation, 'fn');

        // Call remember - should return the cached value
        const result = await cacheService.remember('rememberKey', callbackSpy);

        expect(result).toBe('cachedValue');
        // Verify the callback was NOT called because the value was cached
        expect(callbackSpy).not.toHaveBeenCalled();
        // Verify the cached value is still the same
        expect(cacheService.get('rememberKey')).resolves.toBe('cachedValue');
    });

    it('should call callback and cache result in remember if no cached value', async () => {
        // Ensure the key does not exist initially (cleared in beforeEach)
        expect(cacheService.has('newRememberKey')).resolves.toBe(false);

        // Create a callback function (using spyOn to track calls)
        const callbackImplementation = { fn: async () => 'freshValue' };
        const callbackSpy = spyOn(callbackImplementation, 'fn');

        // Call remember - should execute the callback and cache the result
        const result = await cacheService.remember('newRememberKey', callbackSpy, 5000);

        // Verify the callback was called
        expect(callbackSpy).toHaveBeenCalledTimes(1);
        // Verify the result is the value returned by the callback
        expect(result).toBe('freshValue');
        // Verify the value was cached
        expect(cacheService.get('newRememberKey')).resolves.toBe('freshValue');
    });
});
