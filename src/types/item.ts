export interface Item {
    id?: number,
    user_id: number,
    title: string,
    languages_and_technologies: string[],
    text?: string,
    content?: Record<string, string>,
    date: string,
    sort_date: string,
    time: string,
    redacted?: {
        time: string,
        date: string
    },
    statistics: {
        views: number;
        downloads: number;
        likes: number;
    }
}