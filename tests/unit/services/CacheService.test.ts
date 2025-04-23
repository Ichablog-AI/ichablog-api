import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { CacheService, type CacheServiceParams } from '@be/services/CacheService';
import { LoggerRegistry } from '@be/services/LoggerRegistry'; // Import LoggerRegistry
import { createMockLoggerRegistry } from '@be/test-mocks/MockedLoggerRegistry';
import pino from 'pino'; // Import pino or your logger implementation

describe('CacheService', () => {
    let cacheService: CacheService;

    beforeEach(() => {
        // Instantiate CacheService with required loggerRegistry
        // Assuming default in-memory adapter for these tests
        // You might need to adjust 'type' and 'options' if testing other adapters
        cacheService = new CacheService({
            // Provide minimal valid options for the default adapter if necessary,
            // or adjust based on how your constructor handles defaults now.
            // If the default Keyv() doesn't need type/options, this might be simpler.
            // For clarity, let's assume it might need dummy values if params are strictly required
            type: 'file', // Or another type if needed, or remove if default works
            options: {}, // Provide dummy options
            loggerRegistry: createMockLoggerRegistry(), // Pass the mock registry
        });
        // Clear cache before each test
        return cacheService.clear();
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
