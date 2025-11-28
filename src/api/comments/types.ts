export interface Comment {
    id?: number;
    post_id: number;
    user_id: number;
    user_name: string;
    date: string;
    text: string;
    is_redact: boolean;
}