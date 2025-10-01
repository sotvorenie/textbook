export interface Item {
    id?: number,
    user_id: number,
    title: string,
    languages_and_technologies: string[],
    text: string,
    date: string,
    sort_date: string,
    time: string,
    redact?: {
        value: boolean,
        time: string,
        date: string
    }
}