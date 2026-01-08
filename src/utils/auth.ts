const TOKEN_KEY = 'auth_token'

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