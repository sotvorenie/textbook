import axios from 'axios'

import {authToken} from "../utils/auth.ts";

import {showError} from "../utils/modals.ts";

import useOnlineStore from "../store/useOnlineStore.ts";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
})

client.interceptors.request.use((config) => {
    const token = authToken.get()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

client.interceptors.response.use(
    (response) => {
        const onlineStore = useOnlineStore()

        if (!onlineStore.isOnline) {
            onlineStore.isOnline = true
        }
        return response
    },
    async (error) => {
        const onlineStore = useOnlineStore()

        const isNetworkError =
            error.code === 'ECONNABORTED' ||
            error.message === 'Network Error' ||
            error.message.includes('network') ||
            error.message.includes('ECONN') ||
            (error.request && !error.response)

        if (isNetworkError) {
            onlineStore.isOnline = false
            onlineStore.isOnlineMode = false

            await showError('Нет подключения', 'Проверьте интернет-соединение')

            throw error;
        }

        throw error;
    }
)

export const get = async <T>(url: string, params?: any): Promise<T> => {
    const res = await client.get(url, { params })
    return res.data as T
}

export const post = async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const res = await client.post(url, data, config)
    return res.data as T
}

export const put = async <T>(url: string, data?: any): Promise<T> => {
    const res = await client.put(url, data)
    return res.data as T
}

export const del = async <T>(url: string): Promise<T> => {
    const res = await client.delete(url)
    return res.data as T
}

export const patch = async <T>(url: string, data?: any): Promise<T> => {
    const res = await client.patch(url, data)
    return res.data as T
}

export const isNetworkError = (err: any): boolean => {
    return (
        err?.code === 'ECONNABORTED' ||
        err?.message === 'Network Error' ||
        (err?.request && !err?.response)
    )
}
export class OfflineError extends Error {
    constructor() {
        super('OFFLINE')
    }
}
export class NoTokenError extends Error {
    constructor() {
        super('NO_TOKEN')
    }
}
export class UnauthorizedError extends Error {
    constructor() {
        super('UNAUTHORIZED')
    }
}