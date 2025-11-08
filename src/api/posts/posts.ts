import {del, get, patch, post} from "../base.ts";
import {List} from "../../types/list.ts";
import {Item} from "../../types/item.ts";
import {GetList} from "./types.ts";

import useOnlineStore from "../../store/useOnlineStore.ts";

export const getList = async (
    name: string,
    page: number,
    value: string = '',
    languages: string[],
    user_id: number | null,
    sortBy: string = '-sort_date',
    id: number[] = []
): Promise<{meta: any, items: List[] | []}> => {

    const onlineStore = useOnlineStore();

    try {
        const params: GetList = {
            _select: 'id,title,languages_and_technologies,date',
            page,
            limit: 9,
            user_id,
            sortBy
        }

        if (value) {
            params.title = `*${value}`;
        }

        if (languages?.length > 0) {
            params['languages_and_technologies[]'] = languages;
        }

        if (id?.length > 0) {
            params['id[]'] = id;
        }

        return await get(`/${name}`, params);
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const getItem = async (name: string,  id: number): Promise<Item> => {
    const onlineStore = useOnlineStore();

    try {
        return await get(`/${name}/${id}`)
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const createItem = async (name: string, item: Item): Promise<Item> => {
    const onlineStore = useOnlineStore();

    try {
        return await post(`/${name}`, item)
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const redactItem = async (name: string, item: Item, id: number): Promise<any> => {
    const onlineStore = useOnlineStore();

    try {
        return await patch(`/${name}/${id}`, item)
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}

export const removeItem = async (name: string, id: number): Promise<any> => {
    const onlineStore = useOnlineStore();

    try {
        await del(`/${name}/${id}`)
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
        }
        throw err;
    }
}