export interface LoginData {
    email: string
    password: string
}

export interface RegisterData {
    email: string
    password: string
    name: string,
    ip: string[]
}

export interface AuthResponse {
    token: string
    data: {
        id: number
        email: string
        name: string
    }
}