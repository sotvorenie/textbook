import axios from 'axios'
import router from '../router'

import {authToken} from "../utils/auth.ts";

import {showError} from "../utils/modals.ts";

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
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            authToken.remove()
            await router.push('/')
            // Возвращаем data чтобы не попадать в catch
            return { data: {token: null } }
        }

        await showError('Ошибка сети', 'Что-то пошло не так!!')
        return { data: {} }
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