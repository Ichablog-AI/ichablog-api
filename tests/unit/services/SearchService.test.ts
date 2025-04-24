import { beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { SearchService } from '@be/services/SearchService';
import { createMockLoggerRegistry } from '@be/test-mocks/MockedLoggerRegistry';
import {
    createMockEnqueuedTask,
    createMockMeiliIndex,
    createMockMeiliSearchClient,
} from '@be/test-mocks/MockedMeiliSearchClient';

describe('SearchService', () => {
    const loggerRegistry = createMockLoggerRegistry();
    const index = createMockMeiliIndex();
    const client = createMockMeiliSearchClient(index);
    let service: SearchService;

    beforeEach(() => {
        service = new SearchService({
            loggerRegistry,
            client,
            indexName: 'test-index',
        });
    });

    describe('upsertDocuments()', () => {
        it('should call addDocuments with the given documents', async () => {
            const expectedResult = createMockEnqueuedTask();
            spyOn(index, 'addDocuments').mockResolvedValueOnce(expectedResult);

            const docs = [{ id: '1', title: 'Doc 1' }];
            const result = await service.upsertDocuments(docs);

            expect(index.addDocuments).toHaveBeenCalledWith(docs);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getDocuments()', () => {
        it('should call getDocuments with correct pagination and return result', async () => {
            spyOn(index, 'getDocuments').mockResolvedValueOnce({
                results: [{ id: '1', title: 'Doc' }],
                offset: 20,
                limit: 10,
                total: 100,
            });

            const result = await service.getDocuments(3, {
                limit: 10,
            });

            expect(index.getDocuments).toHaveBeenCalledWith({ offset: 20, limit: 10 });
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(100);
            expect(result.page).toBe(3);
        });
    });

    describe('search()', () => {
        it('should call search() with correct query and return search result', async () => {
            spyOn(index, 'search').mockResolvedValueOnce({
                hits: [{ id: '1', title: 'Result' }],
                offset: 0,
                limit: 10,
                estimatedTotalHits: 1,
                processingTimeMs: 5,
                query: 'test',
            });

            const result = await service.search('test', 1, 10);

            expect(index.search).toHaveBeenCalledWith('test', { offset: 0, limit: 10 });
            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(result.page).toBe(1);
        });
    });

    describe('deleteDocumentsById()', () => {
        it('should call deleteDocuments with given IDs', async () => {
            const expectedResult = createMockEnqueuedTask();
            spyOn(index, 'deleteDocuments').mockResolvedValueOnce(expectedResult);

            const result = await service.deleteDocumentsById(['1', '2']);
            expect(index.deleteDocuments).toHaveBeenCalledWith(['1', '2']);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('dropDocuments()', () => {
        it('should call deleteAllDocuments on the index', async () => {
            const expectedResult = createMockEnqueuedTask();
            spyOn(index, 'deleteAllDocuments').mockResolvedValueOnce(expectedResult);

            const result = await service.dropDocuments();
            expect(index.deleteAllDocuments).toHaveBeenCalled();
            expect(result).toEqual(expectedResult);
        });
    });
});
