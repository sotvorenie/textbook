import {get, post} from "../base.ts";
import {authToken} from "../../utils/auth.ts";
import {LoginData, RegisterData, AuthResponse} from "./types.ts";
import { User } from "../../types/user";
import router from "../../router";

const setToken = (response: AuthResponse): void => {
    if (response.token) {
        authToken.set(response.token);
    }
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response: AuthResponse = await post<AuthResponse>('/register', data);

    setToken(response);

    return response;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
    const response: AuthResponse = await post<AuthResponse>('/auth', data);

    setToken(response);

    return response;
}

export const check = async (): Promise<User | void> => {
    const token = authToken.get();
    if (!token) {
        await router.push('/')
        return
    }

    try {
        const response: User = await get('/auth_me')
        if (!response) {
            authToken.remove()
            await router.push('/')
        } else {
            authToken.set(token);
            return response;
        }
    } catch {
        authToken.remove()
        await router.push('/')
    }
}