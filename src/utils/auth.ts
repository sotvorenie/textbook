const TOKEN_KEY = 'auth_token'

// export const authToken = {
//     //получить токен
//     get(): string | null {
//         if (typeof window !== 'undefined') {
//             const cookies = document.cookie.split(';');
//
//             for (let cookie of cookies) {
//                 const [key, value] = cookie.trim().split('=');
//
//                 if (key === TOKEN_KEY) return decodeURIComponent(value);
//             }
//         }
//         return null
//     },
//
//     //сохранить токен
//     set(token: string): void {
//         if (typeof window !== 'undefined') {
//             document.cookie = `${TOKEN_KEY}=${token}; max-age=604800; path=/; Secure; SameSite=Lax`
//         }
//     },
//
//     //удалить токен
//     remove(): void {
//         if (typeof window !== 'undefined') {
//             document.cookie = `${TOKEN_KEY}=; max-age=0; path=/; Secure; SameSite=Lax`
//         }
//     },
//
//     //проверить наличие токена
//     hasToken(): boolean {
//         const token: string | null = this.get();
//
//         if (token) {
//             this.set(token);
//             return true;
//         }
//
//         return false;
//     }
// }

export const authToken = {
    get(): string | null {
        return localStorage.getItem(TOKEN_KEY)
    },
    set(token: string) {
        localStorage.setItem(TOKEN_KEY, token)
    },
    remove() {
        localStorage.removeItem(TOKEN_KEY)
    },
    hasToken(): boolean {
        return !!this.get()
    }
}