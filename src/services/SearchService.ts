import type { LoggerRegistry } from '@be/services/LoggerRegistry';
import type { DocumentsQuery, EnqueuedTask, MeiliSearch, RecordAny, SearchParams, SearchResponse } from 'meilisearch';
import type { Logger } from 'pino';

export type SearchServiceParams = {
    loggerRegistry: LoggerRegistry;
    client: MeiliSearch;
    indexName: string;
    filterableAttributes?: string[];
};

export type PaginatedResult<T> = {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type SearchResult<T> = PaginatedResult<T> & Omit<SearchResponse<T>, 'hits'>;

export class SearchService<DocType extends RecordAny = RecordAny> {
    protected readonly indexName: string;
    protected readonly filterableAttributes: string[];
    protected readonly adapter: MeiliSearch;
    protected readonly logger: Logger;

    constructor({ loggerRegistry, client, indexName, filterableAttributes }: SearchServiceParams) {
        this.adapter = client;
        this.indexName = indexName;
        this.filterableAttributes = filterableAttributes ?? [];
        this.logger = loggerRegistry.getLogger(`SearchService/${indexName}`);

        if (this.filterableAttributes?.length) {
            void this.ensureFilterableAttributes();
        }
    }

    protected async ensureFilterableAttributes(): Promise<void> {
        this.logger.debug(`Verifying filterable attributes for ${this.indexName}`);
        const index = this.adapter.index(this.indexName);
        try {
            const current = await index.getFilterableAttributes();
            const currentList = current ?? [];

            const missing = this.filterableAttributes.filter((attr) => !currentList.includes(attr));
            if (missing.length > 0) {
                const updated = [...new Set([...currentList, ...missing])];
                this.logger.debug(`Updating filterable attributes for ${this.indexName}: ${missing.join(', ')}`);
                await index.updateFilterableAttributes(updated);
            } else {
                this.logger.debug(`All filterable attributes for ${this.indexName} are already set`);
            }
        } catch (error) {
            this.logger.error(`Could not verify or update filterable attributes for ${this.indexName}: ${error}`);
            throw error;
        }
    }

    async upsertDocuments(documents: DocType[]): Promise<EnqueuedTask> {
        this.logger.debug(`Upserting ${documents.length} documents into ${this.indexName}`);
        try {
            return await this.adapter.index(this.indexName).addDocuments(documents);
        } catch (error) {
            this.logger.error(error, `Failed to upsert documents into ${this.indexName}`);
            throw error;
        }
    }

    async getDocuments(
        page = 1,
        options: Omit<DocumentsQuery<DocType>, 'offset'> = {}
    ): Promise<PaginatedResult<DocType>> {
        const limit = options.limit ?? 20;
        const offset = (page - 1) * limit;

        this.logger.debug(
            `Listing documents from ${this.indexName}, page=${page}, limit=${limit}, ids=${options.ids?.length ?? 0}`
        );

        try {
            const response = await this.adapter.index(this.indexName).getDocuments<DocType>({ ...options, offset });

            const resolvedLimit = Number(response.limit);
            const resolvedOffset = Number(response.offset);
            const resolvedPage = Math.floor(resolvedOffset / resolvedLimit) + 1;
            const total = response.total ?? response.results.length;
            const totalPages = Math.max(1, Math.ceil(total / resolvedLimit));

            return {
                data: response.results,
                page: resolvedPage,
                limit: resolvedLimit,
                total,
                totalPages,
            };
        } catch (error) {
            this.logger.error(error, `Failed to list documents from ${this.indexName}`);
            throw error;
        }
    }

    async deleteDocumentsById(ids: string[]): Promise<EnqueuedTask> {
        this.logger.debug(`Deleting ${ids.length} documents from ${this.indexName}`);
        try {
            return await this.adapter.index(this.indexName).deleteDocuments(ids);
        } catch (error) {
            this.logger.error(error, `Failed to delete documents from ${this.indexName}`);
            throw error;
        }
    }

    async dropDocuments(): Promise<EnqueuedTask> {
        this.logger.debug(`Dropping all documents from ${this.indexName}`);
        try {
            return await this.adapter.index(this.indexName).deleteAllDocuments();
        } catch (error) {
            this.logger.error(error, `Failed to drop all documents from ${this.indexName}`);
            throw error;
        }
    }

    async search(
        query: string,
        page = 1,
        limit = 20,
        options: Omit<SearchParams, 'offset' | 'limit'> = {}
    ): Promise<SearchResult<DocType>> {
        const offset = (page - 1) * limit;
        this.logger.debug(`Searching ${this.indexName} for query="${query}", page=${page}, limit=${limit}`);

        try {
            const response = await this.adapter
                .index(this.indexName)
                .search<DocType>(query, { offset, limit, ...options });

            const resolvedLimit = Number(response.limit || limit);
            const resolvedOffset = Number(response.offset || offset);
            const resolvedPage = Math.floor(resolvedOffset / resolvedLimit) + 1;

            const total = response.estimatedTotalHits ?? response.hits.length;
            const totalPages = Math.max(1, Math.ceil(total / resolvedLimit));

            return {
                data: response.hits,
                page: resolvedPage,
                limit: resolvedLimit,
                total,
                totalPages,
                query: response.query,
                processingTimeMs: response.processingTimeMs,
                facetDistribution: response.facetDistribution,
                facetStats: response.facetStats,
                facetsByIndex: response.facetsByIndex,
            };
        } catch (error) {
            this.logger.error(error, `Search failed on ${this.indexName}`);
            throw error;
        }
    }
}
