export interface List {
    id: number,
    title: string,
    date: string,
    languages_and_technologies: string[],
}

export interface UnAuthorizedList extends Omit<List, 'languages_and_technologies'> {
    type: string;
    offline: string;
    block_name: string;
}

export interface ListBlog {
    id: number,
    title: string,
    date: string,
    time: string
}