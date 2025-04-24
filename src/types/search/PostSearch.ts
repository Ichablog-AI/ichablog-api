import type { SearchService } from '@be/services/SearchService';

export type PostSearchDoc = {
    id: string;
    title: string;
    body: string;
    status: 'draft' | 'published';
    authorId: string;
};
export type PostSearch = SearchService<PostSearchDoc>;
export const postSearchName = 'posts';
export const postFilterableAttributes = ['status', 'authorId'];
