import {del, get, patch, post} from "../base.ts";

import useUserStore from "../../store/userStore.ts";
import {userAva} from "../../utils/ava.ts";
import {getCurrentDateTime} from "../../composables/useDate.ts";
const userStore = useUserStore();

import useOnlineStore from "../../store/useOnlineStore.ts";

export const postFile = async (file: File): Promise<void> => {
    const onlineStore = useOnlineStore()

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response: {id: number, url: string} =
            await post('/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

        if (response) {
            userStore.user.ava = {
                url: response.url,
                id: response.id,
            }
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const postAva = async (): Promise<any> => {
    const onlineStore = useOnlineStore()

    try {
        await patch(`/users/${userStore.user.id}`, {
            ava: userStore.user.ava
        })
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const deletePredLastFile = async (id: number) => {
    const onlineStore = useOnlineStore()

    try {
        await del(`/uploads/${id}`)
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const getAva = async (): Promise<void> => {
    const onlineStore = useOnlineStore()

    try {
        const response: {ava: {url: string, id: number}}[] = await get(`/users?id=${userStore.user.id}&_select=ava`)

        if (response) {
            userStore.user.ava = response[0]?.ava

            userAva.set()
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
            return
        }

        return
    }
}

export const getLastSession = async (): Promise<void> => {
    const onlineStore = useOnlineStore()

    try {
        const response: {last_session: string} = await get(`/users/${userStore.user.id}?_select=last_session`)

        if (response?.last_session) {
            userStore.lastSession = response?.last_session
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        return
    }
}

export const setLastSession = async ():Promise<void> => {
    const onlineStore = useOnlineStore()

    try {
        const dateTime = getCurrentDateTime()

        await patch(`users/${userStore.user.id}`, {
            last_session: dateTime.date
        })
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        return
    }
}