import axios from 'axios'

import {authToken} from "../utils/auth.ts";

import {showError} from "../utils/modals.ts";

import useOnlineStore from "../store/useOnlineStore.ts";
import router from "../router";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
})

// Интерцепторы
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

        // if (error.response?.status === 401) {
        //     authToken.remove()
        //     await showError(
        //         'Ошибка авторизации',
        //         'Вы будете перенаправлены на страницу авторизации'
        //     )
        //     await router.push('/')
        //
        //     throw error;
        // }

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

            return Promise.reject(error)
        }

        return Promise.reject(error)
    }
)

// Базовые методы
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