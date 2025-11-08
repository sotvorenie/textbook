import {get, post} from "../base.ts";
import {authToken} from "../../utils/auth.ts";
import {LoginData, RegisterData, AuthResponse} from "./types.ts";
import { User } from "../../types/user";
import router from "../../router";

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
    const onlineStore = useOnlineStore();

    const token = authToken.get();
    if (!token) {
        await router.push('/')
        return
    }

    try {
        const response: User = await get('/auth_me')
        if (!response) {
            authToken.remove()
            onlineStore.isOnline = true;
            await router.push('/')
        } else {
            authToken.set(token);
            return response;
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            return;
        }

        authToken.remove()
        await router.push('/')
    }
}