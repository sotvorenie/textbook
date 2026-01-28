import {del, patch, post} from "../base.ts";

import useUserStore from "../../store/useUserStore.ts";
import {getCurrentDateTime} from "../../composables/useDate.ts";

export const postFile = async (file: File, signal?: AbortSignal): Promise<void> => {
    const userStore = useUserStore();

    const formData = new FormData();
    formData.append('file', file);

    const response: {id: number, url: string} =
        await post('/uploads', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }, signal)

    if (response) {
        userStore.user.ava = {
            url: response.url,
            id: response.id,
        }
    }
}

export const postAva = async (signal?: AbortSignal): Promise<any> => {
    const userStore = useUserStore();

    await patch(`/users/${userStore.user.id}`, {
        ava: userStore.user.ava
    }, signal)
}

export const deletePredLastFile = async (id: number, signal?: AbortSignal) => {
    await del(`/uploads/${id}`, signal)
}

export const setLastSession = async (signal?: AbortSignal):Promise<void> => {
    const userStore = useUserStore();

    const dateTime = getCurrentDateTime()

    if (dateTime.date === userStore.lastSession) return

    await patch(`users/${userStore.user.id}`, {
        last_session: dateTime.date
    }, signal)
}