import {AuthResponse, LoginData, RegisterData} from "./types.ts";
import {User} from "../../types/user";

import {authToken} from "../../utils/auth.ts";

import {get, isNetworkError, NoTokenError, OfflineError, post, UnauthorizedError} from "../base.ts";


const setToken = (response: AuthResponse): void => {
    if (response.token) {
        authToken.set(response.token);
    }
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response: AuthResponse = await post<AuthResponse>('/register', data)
    setToken(response)
    return response
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
    const response: AuthResponse = await post<AuthResponse>('/auth', data)
    setToken(response)
    return response
}

export const check = async (): Promise<User | void> => {
    const token = authToken.get();
    if (!token) throw new NoTokenError()

    try {
        return await get('/auth_me')
    } catch (err: any) {
        if (isNetworkError(err)) {
            throw new OfflineError()
        }

        if (err.response?.status === 401) {
            authToken.remove()
            throw new UnauthorizedError()
        }
    }
}