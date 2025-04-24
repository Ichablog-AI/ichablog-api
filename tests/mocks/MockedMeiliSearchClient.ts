import { mock } from 'bun:test';
import type { EnqueuedTask, Index, MeiliSearch, TaskStatus, TaskType } from 'meilisearch';

export const createMockMeiliIndex = () =>
    ({
        addDocuments: mock(),
        getDocuments: mock(),
        deleteDocuments: mock(),
        deleteAllDocuments: mock(),
        search: mock(),
        getFilterableAttributes: mock(),
        updateFilterableAttributes: mock(),
    }) as unknown as Index;

export const createMockMeiliSearchClient = (index?: Index): MeiliSearch => {
    const indexMock = index ?? createMockMeiliIndex();

    return {
        index: mock().mockReturnValue(indexMock),
    } as unknown as MeiliSearch;
};

export const createMockEnqueuedTask = (overrides?: Partial<EnqueuedTask>): EnqueuedTask => ({
    taskUid: 123,
    indexUid: null,
    status: 'mockedStatus' as TaskStatus,
    type: 'mockedType' as TaskType,
    enqueuedAt: Date.now().toString(),
    ...overrides,
});
