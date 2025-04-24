import type { SearchService } from '@be/services/SearchService';

export type PostSearchDoc = {
    id: string;
    title: string;
    body: string;
    status: 'draft' | 'published';
    authorId: string;
};
export type PostSearch = SearchService<PostSearchDoc>;
export const POST_SEARCH_SERVICE = 'POST_SEARCH_SERVICE' as const;
export const postSearchName = 'posts';
export const postFilterableAttributes = ['status', 'authorId'];
