import {List} from "../../types/list.ts";
import {Item} from "../../types/item.ts";
import {GetList} from "./types.ts";

import {del, get, isNetworkError, patch, post} from "../base.ts";
import {getListFromDB, getItemFromDB, createItemInDB, removeFromDB, redactItemInDB} from "./postsDB.ts";

import useOnlineStore from "../../store/useOnlineStore.ts";
import useHomeStore from "../../store/useHomeStore.ts";

type GetListParams = {
    name: string
    page: number
    languages: string[]
    user_id: number | null
    value?: string
    sortBy?: string
    id?: number[]
}
export const getList = async ({
    name,
    page,
    languages,
    user_id,
    value = "",
    sortBy = "-sort_date",
    id = [],
}: GetListParams): Promise<{ meta: any; items: List[] }> => {
    const onlineStore = useOnlineStore();
    const homeStore = useHomeStore();

    if (!onlineStore.isOnlineMode)
        return getListFromDB({name, page, value, languages, user_id, sortBy, id})

    const params: GetList = {
        _select: "id,title,languages_and_technologies,date,statistics",
        page,
        limit: homeStore.pageNumberForAPI ?? 9,
        user_id,
        sortBy,
    }

    if (value) params.title = `*${value}`
    if (languages?.length > 0)
        params["languages_and_technologies[]"] = languages
    if (id?.length > 0) params["id[]"] = id

    try {
        return await get(`/${name}`, params)
    } catch (err: any) {
        if (isNetworkError(err))
            return getListFromDB({name, page, value, languages, user_id, sortBy, id})

        throw err
    }
}

export const getItem = async (name: string, id: number): Promise<Item> => {
    const onlineStore = useOnlineStore();

    if (!onlineStore.isOnlineMode)
        return getItemFromDB(name, id)

    try {
        return await get(`/${name}/${id}`)
    } catch (err: any) {
        if (isNetworkError(err))
            return await getItemFromDB(name, id)

        throw err
    }
};

export const createItem = async (
    name: string,
    item: Item,
    createInDB: boolean = true,
    createInAPI: boolean = true
): Promise<Item> => {
    const onlineStore = useOnlineStore();

    if (!onlineStore.isOnlineMode && !createInAPI)
        return createItemInDB(name, item, -1, "create")

    try {
        const createdItem: Item = await post(`/${name}`, item)

        if (createInDB) {
            await createItemInDB(
                name,
                item,
                createdItem.id as number
            )
        }

        return createdItem
    } catch (err: any) {
        if (isNetworkError(err))
            return createItemInDB(name, item, -1, "create")

        throw err
    }
};

export const redactItem = async (
    name: string,
    item: Item,
    id: number,
    redactInDB: boolean = true
): Promise<any> => {
    const onlineStore = useOnlineStore();

    if (!onlineStore.isOnlineMode)
        return redactItemInDB(name, item, id, "redact")

    try {
        const redactedItem = await patch(`/${name}/${id}`, item)

        if (redactInDB) await redactItemInDB(name, item, id)

        return redactedItem
    } catch (err: any) {
        if (isNetworkError(err))
            return redactItemInDB(name, item, id, "redact")

        throw err
    }
};

export const removeItem = async (name: string, id: number): Promise<any> => {
    const onlineStore = useOnlineStore();

    if (!onlineStore.isOnlineMode) return removeFromDB(name, id)

    try {
        await del(`/${name}/${id}`)
    } catch (err: any) {
        if (isNetworkError(err))
            await removeFromDB(name, id)

        throw err
    }
};

export const updateStatistics = async (
    name: string,
    id: number,
    type: keyof Item['statistics'],
    statistics: Item['statistics']
) => {
    const onlineStore = useOnlineStore();

    if  (!onlineStore.isOnlineMode) return

    statistics[type] = (+statistics[type] || 0) + 1

    await patch(`/${name}/${id}`, {statistics})
}

export const getAuthor = async (id: number, getSessionAndEmail: boolean = false, signal?: AbortSignal):
    Promise<{ava?: {url: string}, name: string, last_session: string, email: string}> => {
    return await get(
        `/users/${id}?_select=name,ava${getSessionAndEmail ? ',last_session,email' : ''}`,
        undefined,
        signal
    )
}