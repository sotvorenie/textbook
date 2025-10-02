import {get, post} from "../base.ts";
import {List} from "../../types/list.ts";
import {Item} from "../../types/item.ts";
import {GetList} from "./types.ts";

export const getList = async (
    name: string,
    page: number,
    value: string = '',
    languages: string[],
    user_id: number | null,
    sortBy: string = '-sort_date',
    id: number[] = []
): Promise<{meta: any, items: List[] | []}> => {

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
}

export const getItem = async (name: string,  id: number): Promise<Item> => {
    return await get(`/${name}/${id}`)
}

export const createItem = async (name: string, item: Item): Promise<any> => {
    await post(`/${name}`, item)
}