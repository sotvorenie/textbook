import {del, get, patch, post} from "../base.ts";

import useUserStore from "../../store/userStore.ts";
import {userAva} from "../../utils/ava.ts";
import {getCurrentDateTime} from "../../composables/useDate.ts";
const userStore = useUserStore();

export const postFile = async (file: File): Promise<void> => {
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
}

export const postAva = async (): Promise<any> => {
    await patch(`/users/${userStore.user.id}`, {
        ava: userStore.user.ava
    })
}

export const deletePredLastFile = async (id: number) => {
    await del(`/uploads/${id}`)
}

export const getAva = async (): Promise<void> => {
    const response: {ava: {url: string, id: number}}[] = await get(`/users?id=${userStore.user.id}&_select=ava`)

    if (response) {
        userStore.user.ava = response[0]?.ava

        userAva.set()
    }
}

export const getLastSession = async (): Promise<void> => {
    const response: {last_session: string} = await get(`/users/${userStore.user.id}?_select=last_session`)

    if (response?.last_session) {
        userStore.lastSession = response?.last_session
    }
}

export const setLastSession = async ():Promise<void> => {
    const dateTime = getCurrentDateTime()

    await patch(`users/${userStore.user.id}`, {
        last_session: dateTime.date
    })
}