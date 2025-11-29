import {del, get, patch, post} from "../base.ts";
import {List} from "../../types/list.ts";
import {Item} from "../../types/item.ts";
import {GetList} from "./types.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";
import useHomeStore from "../../store/useHomeStore.ts";

import {getListFromDB, getItemFromDB, createItemInDB, removeFromDB, redactItemInDB} from "./postsDB.ts";

export const getList = async (
    name: string,
    page: number,
    value: string = "",
    languages: string[],
    user_id: number | null,
    sortBy: string = "-sort_date",
    id: number[] = []
): Promise<{ meta: any; items: List[] | [] }> => {
    const onlineStore = useOnlineStore();
    const homeStore = useHomeStore();

    try {
        if (onlineStore.isOnlineMode) {
            const params: GetList = {
                _select: "id,title,languages_and_technologies,date,statistics",
                page,
                limit: homeStore.pageNumberForAPI ?? 9,
                user_id,
                sortBy,
            };

            if (value) params.title = `*${value}`;
            if (languages?.length > 0)
                params["languages_and_technologies[]"] = languages;
            if (id?.length > 0) params["id[]"] = id;

            return await get(`/${name}`, params);
        } else {
            return await getListFromDB(name, page, value, languages, user_id, sortBy, id);
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
            return await getListFromDB(name, page, value, languages, user_id, sortBy, id);
        }
        throw err;
    }
};

export const getItem = async (name: string, id: number): Promise<Item> => {
    const onlineStore = useOnlineStore();

    try {
        if (onlineStore.isOnlineMode) {
            return await get(`/${name}/${id}`);
        } else {
            return await getItemFromDB(name, id);
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;
            return await getItemFromDB(name, id);
        }
        throw err;
    }
};

export const createItem = async (
    name: string,
    item: Item,
    createInDB: boolean = true,
    createInAPI: boolean = true
): Promise<Item> => {
    const onlineStore = useOnlineStore();

    try {
        if (onlineStore.isOnlineMode && createInAPI) {
            const createdItem = await post(`/${name}`, item) as Item

            if (createInDB) {
                await createItemInDB(
                    name,
                    item,
                    createdItem.id as number
                );
            }

            return createdItem
        } else {
            return await createItemInDB(name, item, -1, "create");
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;

            return await createItemInDB(name, item, -1, "create");
        }
        throw err;
    }
};

export const redactItem = async (
    name: string,
    item: Item,
    id: number,
    redactInDB: boolean = true
): Promise<any> => {
    const onlineStore = useOnlineStore();

    try {
        if (onlineStore.isOnlineMode) {
            const redactedItem = await patch(`/${name}/${id}`, item);

            if (redactInDB) {
                await redactItemInDB(name, item, id);
            }

            return redactedItem
        } else {
            return await redactItemInDB(name, item, id, "redact")
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;

            return await redactItemInDB(name, item, id, "redact");
        }
        throw err;
    }
};

export const removeItem = async (name: string, id: number): Promise<any> => {
    const onlineStore = useOnlineStore();

    try {
        if (onlineStore.isOnlineMode) {
            await del(`/${name}/${id}`);
        } else {
            await removeFromDB(name, id);
        }
    } catch (err: any) {
        if (err.message === "Network Error" || err.code === "ECONNABORTED") {
            onlineStore.isOnline = false;
            onlineStore.isOnlineMode = false;

            await removeFromDB(name, id);
        }
        throw err;
    }
};

export const updateStatistics = async (
    name: string,
    id: number,
    type: keyof Item['statistics'],
    statistics: Item['statistics']
) => {
    const onlineStore = useOnlineStore();

    try {
        if  (!onlineStore.isOnlineMode) return

        statistics[type] = +statistics[type] + 1

        await patch(`/${name}/${id}`, {
            statistics
        })
    } catch (_) {
        return
    }
}