import {get, patch, post} from "../base.ts";

import {Comment} from "./types.ts";

import {getCurrentDateTime} from "../../composables/useDate.ts";

import useOnlineStore from "../../store/useOnlineStore.ts";
import useIdStore from "../../store/useIdStore.ts";
import useUserStore from "../../store/useUserStore.ts";

export const getComments = async (name: string, page: number = 1): Promise<any> => {
    const onlineStore = useOnlineStore();
    const idStore = useIdStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const id: number = idStore.idValues[name]

        const params = {
            page,
            limit: 9,
            post_id: id,
            sortBy: '-date',
        }

        return await get(`/comments`, params)
    } catch (err) {
        throw err;
    }
}

export const setComment = async (name: string, text: string): Promise<Comment | undefined> => {
    const onlineStore = useOnlineStore();
    const userStore = useUserStore();
    const idStore = useIdStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const dateInfo = getCurrentDateTime()
        const date = dateInfo.date

        const id: number = idStore.idValues[name]

        const comment: Comment = {
            post_id: id,
            user_id: userStore.user.id,
            user_name: userStore.user.name,
            date,
            text,
            is_redact: false
        }

        return await post(`/comments`, comment)
    } catch (err) {
        throw err;
    }
}

export const redactComment = async (id: number, text: string): Promise<Comment | undefined> => {
    const onlineStore = useOnlineStore();
    const userStore = useUserStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const dateInfo = getCurrentDateTime()
        const date = dateInfo.date

        const comment: Comment = {
            post_id: id,
            user_id: userStore.user.id,
            user_name: userStore.user.name,
            date,
            text,
            is_redact: true
        }

        return await patch(`/comments/${id}`, comment)
    } catch (err) {
        throw err;
    }
}

// проверяем: оставлял ли пользователь комментарий у этой записи (чтобы скрывать блок написания нового комментария)
export const checkComment = async (name: string): Promise<boolean | undefined> => {
    const userStore = useUserStore();
    const idStore = useIdStore();
    const onlineStore = useOnlineStore();

    if (!onlineStore.isOnlineMode) return

    try {
        const id: number = idStore.idValues[name]

        const check: Comment[] | undefined = await get(`/comments?post_id=${id}&user_id=${userStore.user.id}`)

        return !(!check || check.length === 0);


    } catch (err) {
        throw err;
    }
}