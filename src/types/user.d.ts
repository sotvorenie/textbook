export interface User {
    email: string,
    name: string,
    id: number,
    ava?: {
        url: string,
        id: number,
    }
}