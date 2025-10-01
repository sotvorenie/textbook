export interface GetList {
    _select: string,
    page: number,
    limit: number,
    user_id: number | null,
    sortBy: string,
    title?: string,
    'languages_and_technologies[]'?: string[];
}