import {Item} from "./item.ts";

export interface List {
    id: number,
    title: string,
    date: string,
    languages_and_technologies: string[],
    statistics: Item['statistics']
}

export interface UnAuthorizedList extends Omit<List, 'languages_and_technologies'> {
    offline: string;
    block_name: string;
    user_id?: number;
}

export interface ListBlog {
    id: number,
    title: string,
    date: string,
    time: string
}