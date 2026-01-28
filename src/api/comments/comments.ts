import {Comment} from "./types.ts";

import {getCurrentDateTime} from "../../composables/useDate.ts";

import {del, get, patch, post} from "../base.ts";

import useUserStore from "../../store/useUserStore.ts";

export const getComments = async (
    id: number,
    name: string,
    page: number = 1,
    signal?: AbortSignal
): Promise<any> => {
    const params = {
        page,
        limit: 9,
        post_id: id,
        sortBy: '-date',
    }

    return await get(`/comments_${name}`, params, signal)
}

export const setComment = async (
    id: number,
    name: string,
    text: string,
    signal?: AbortSignal
): Promise<Comment | undefined> => {
    const userStore = useUserStore();

    const dateInfo = getCurrentDateTime()
    const date = dateInfo.date

    const comment: Comment = {
        post_id: id,
        user_id: userStore.user.id,
        user_name: userStore.user.name,
        date,
        text,
        is_redact: false
    }

    return await post(`/comments_${name}`, comment, undefined, signal)
}

export const redactComment = async (
    postId: number,
    name: string,
    id: number,
    text: string,
    signal?: AbortSignal
): Promise<Comment | undefined> => {
    const userStore = useUserStore();

    const dateInfo = getCurrentDateTime()
    const date = dateInfo.date

    const comment: Comment = {
        post_id: postId,
        user_id: userStore.user.id,
        user_name: userStore.user.name,
        date,
        text,
        is_redact: true
    }

    return await patch(`/comments_${name}/${id}`, comment, signal)
}

// проверяем: оставлял ли пользователь комментарий у этой записи (чтобы скрывать блок написания нового комментария)
export const checkComment = async (
    id: number,
    name: string,
    signal?: AbortSignal
): Promise<boolean | undefined> => {
    const userStore = useUserStore();

    const check: Comment[] | undefined =
        await get(
            `/comments_${name}?post_id=${id}&user_id=${userStore.user.id}`,
            undefined,
            signal
        )

    return !(!check || check.length === 0);
}

export const removeComment = async (
    name: string,
    id: number,
    signal?: AbortSignal
): Promise<void> => {
    await del(`/comments_${name}/${id}`, signal)
}