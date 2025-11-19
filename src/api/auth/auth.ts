import {get, post} from "../base.ts";
import {authToken} from "../../utils/auth.ts";
import {AuthResponse, LoginData, RegisterData} from "./types.ts";
import {User} from "../../types/user";

import useOnlineStore from "../../store/useOnlineStore.ts";

const setToken = (response: AuthResponse): void => {
    if (response.token) {
        authToken.set(response.token);
    }
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
    const onlineStore = useOnlineStore();

    try {
        const response: AuthResponse = await post<AuthResponse>('/register', data);

        setToken(response);

        return response;
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
    const onlineStore = useOnlineStore();

    try {
        const response: AuthResponse = await post<AuthResponse>('/auth', data);

        setToken(response);

        return response;
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const check = async (): Promise<User | void> => {
    const token = authToken.get();
    if (!token) throw new Error('NO_TOKEN')

    try {
        return await get('/auth_me')
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            throw new Error('OFFLINE')
        }

        authToken.remove()
        throw err
    }
}