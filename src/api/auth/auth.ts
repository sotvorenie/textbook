import {AuthResponse, LoginData, RegisterData} from "./types.ts";
import {User} from "../../types/user";

import {authToken} from "../../utils/auth.ts";

import {get, isNetworkError, NoTokenError, OfflineError, post, UnauthorizedError} from "../base.ts";


const setToken = (response: AuthResponse): void => {
    if (response.token) {
        authToken.set(response.token);
    }
}

export const register = async (data: RegisterData, signal?: AbortSignal): Promise<AuthResponse> => {
    const response: AuthResponse = await post<AuthResponse>('/register', data, undefined, signal)
    setToken(response)
    return response
}

export const login = async (data: LoginData, signal?: AbortSignal): Promise<AuthResponse> => {
    const response: AuthResponse = await post<AuthResponse>('/auth', data, undefined, signal)
    setToken(response)
    return response
}

export const check = async (signal?: AbortSignal): Promise<User | void> => {
    const token = authToken.get();
    if (!token) throw new NoTokenError()

    try {
        return await get('/auth_me', undefined, signal)
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