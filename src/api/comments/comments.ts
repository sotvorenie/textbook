import {del, get, patch, post} from "../base.ts";

import {Comment} from "./types.ts";

import {getCurrentDateTime} from "../../composables/useDate.ts";

import useIdStore from "../../store/useIdStore.ts";
import useUserStore from "../../store/useUserStore.ts";

export const getComments = async (
    name: string,
    page: number = 1
): Promise<any> => {
    const idStore = useIdStore();

    try {
        const id: number = idStore.idValues[name]

        const params = {
            page,
            limit: 9,
            post_id: id,
            sortBy: '-date',
        }

        return await get(`/comments_${name}`, params)
    } catch (err) {
        throw err;
    }
}

export const setComment = async (
    name: string,
    apiName: string,
    text: string
): Promise<Comment | undefined> => {
    const userStore = useUserStore();
    const idStore = useIdStore();

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

        return await post(`/comments_${apiName}`, comment)
    } catch (err) {
        throw err;
    }
}

export const redactComment = async (
    name: string,
    id: number,
    text: string
): Promise<Comment | undefined> => {
    const userStore = useUserStore();

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

        return await patch(`/comments_${name}/${id}`, comment)
    } catch (err) {
        throw err;
    }
}

// проверяем: оставлял ли пользователь комментарий у этой записи (чтобы скрывать блок написания нового комментария)
export const checkComment = async (
    name: string,
): Promise<boolean | undefined> => {
    const userStore = useUserStore();
    const idStore = useIdStore();

    try {
        const id: number = idStore.idValues[name]

        const check: Comment[] | undefined =
            await get(`/comments_${name}?post_id=${id}&user_id=${userStore.user.id}`)

        return !(!check || check.length === 0);


    } catch (err) {
        throw err;
    }
}

export const removeComment = async (
    name: string,
    id: number
): Promise<void> => {
    try {
        await del(`/comments_${name}/${id}`)
    } catch (err) {
        throw err;
    }
}