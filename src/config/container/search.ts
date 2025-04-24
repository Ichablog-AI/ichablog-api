import appConfig from '@be/config';
import { LoggerRegistry } from '@be/services/LoggerRegistry';
import { SearchService } from '@be/services/SearchService';
import {
    POST_SEARCH_SERVICE,
    type PostSearch,
    postFilterableAttributes,
    postSearchName,
} from '@be/types/search/PostSearch';
import { MeiliSearch } from 'meilisearch';
import type { DependencyContainer } from 'tsyringe';

export const registerSearchBindings = (container: DependencyContainer) => {
    container.register<MeiliSearch>(MeiliSearch, {
        useFactory: () => new MeiliSearch(appConfig.meilisearch.clientOptions),
    });

    container.register<PostSearch>(POST_SEARCH_SERVICE, {
        useFactory: (c) =>
            new SearchService({
                loggerRegistry: c.resolve(LoggerRegistry),
                client: c.resolve(MeiliSearch),
                indexName: postSearchName,
                filterableAttributes: postFilterableAttributes,
            }),
    });
};
