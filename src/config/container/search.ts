import appConfig from '@be/config';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { SearchService } from '@be/services/SearchService';
import {
    POST_SEARCH_SERVICE,
    type PostSearch,
    postFilterableAttributes,
    postSearchName,
} from '@be/types/search/PostSearch';
import { registerSingletonFactory } from '@be/utils/registerSingletonFactory';
import { MeiliSearch } from 'meilisearch';
import type { DependencyContainer } from 'tsyringe';

export const registerSearchBindings = (container: DependencyContainer) => {
    registerSingletonFactory(container, MeiliSearch, () => new MeiliSearch(appConfig.meilisearch.clientOptions));

    registerSingletonFactory<PostSearch>(
        container,
        POST_SEARCH_SERVICE,
        (c) =>
            new SearchService({
                loggerRegistry: c.resolve(LoggerRegistry),
                client: c.resolve(MeiliSearch),
                indexName: postSearchName,
                filterableAttributes: postFilterableAttributes,
            })
    );
};
