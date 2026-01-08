import {List} from "../../types/list.ts";
import {Item} from "../../types/item.ts";
import {executeSQL, selectSQL, tablesConfig} from "../database.ts";
import {showError} from "../../utils/modals.ts";
import useIdStore from "../../store/useIdStore.ts";

type GetListParams = {
    name: string
    page: number
    languages: string[]
    user_id: number | null
    value?: string
    sortBy?: string
    id?: number[]
}
export const getListFromDB = async ({
    name,
    page,
    value = "",
    filterLanguages = [],
    user_id ,
    sortBy = "-sort_date",
    id = []
}: GetListParams): Promise<{ meta: any; items: List[] }> => {
    const config = tablesConfig[name]
    if (!config) throw new Error(`Неизвестная таблица: ${name}`)

    const limit = 9
    const offset = (page - 1) * limit

    const whereParts: string[] = []
    const params: any[] = []

    if (filterLanguages.length > 0) {
        const languageConditions = filterLanguages.map(() => `languages_and_technologies LIKE ?`)
        whereParts.push(`(${languageConditions.join(' OR ')})`)
        params.push(...filterLanguages.map(lang => `%"${lang}"%`))
    }

    if (user_id !== null && user_id !== undefined) {
        whereParts.push(`user_id = ?`)
        params.push(user_id)
    }

    if (value) {
        whereParts.push(`title LIKE ?`)
        params.push(`%${value}%`)
    }

    if (id && id.length > 0) {
        whereParts.push(`id IN (${id.map(() => "?").join(",")})`)
        params.push(...id)
    }

    const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : ""
    const sortName = sortBy.replace("-", "")
    const sortOrder = sortBy.startsWith("-") ? "DESC" : "ASC"

    const items = await selectSQL<any>(
        `SELECT 
                id,
                title,
                date,
                languages_and_technologies
              FROM ${config.table} ${where} ORDER BY ${sortName} ${sortOrder} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
    )

    const processedItems = items.map(item => ({
        ...item,
        languages_and_technologies: item.languages_and_technologies ? JSON.parse(item.languages_and_technologies) : []
    }))

    const countRows = await selectSQL<{ total: number }>(
        `SELECT COUNT(*) AS total FROM ${config.table} ${where}`,
        params
    )

    const total = countRows[0]?.total ?? 0;

    const meta = {
        current_page: page,
        from: total === 0 ? 0 : offset + 1,
        to: Math.min(offset + limit, total),
        total,
        per_page: limit,
        last_page: Math.ceil(total / limit),
    }

    return { meta, items: processedItems }
};

export const getItemFromDB = async (
    name: string,
    id: number
): Promise<Item> => {
    const config = tablesConfig[name]

    const items = await selectSQL<any>(`SELECT * FROM ${config.table} WHERE id = ?`, [id])

    const item = items[0]

    let content = item.content;
    if (typeof content === 'string') {
        try {
            content = JSON.parse(content)
        } catch (e) {
            console.error('Error parsing content:', e)
            content = {}
        }
    }

    return {
        ...item,
        content: content,
        languages_and_technologies: item.languages_and_technologies ? JSON.parse(item.languages_and_technologies) : []
    }
};

export const createItemInDB = async (
    name: string,
    item: Item,
    id: number = -1,
    offline: string = ""
) => {
    try {
        const config = tablesConfig[name];

        const getNextId = async (table: string): Promise<number> => {
            const result = await selectSQL<{max_id: number}>(`SELECT MAX(id) as max_id FROM ${table}`);
            const maxId = result[0]?.max_id || 0;

            for (let nextId = maxId + 1; nextId < maxId + 100; nextId++) {
                const existing = await selectSQL(`SELECT id FROM ${table} WHERE id = ?`, [nextId]);
                if (existing.length === 0) return nextId;
            }
            throw new Error(`Не удалось найти свободный ID для таблицы ${table}`);
        };

        let itemId: number;
        if (id >= 0) {
            const existing = await selectSQL(`SELECT id FROM ${config.table} WHERE id = ?`, [id]);
            itemId = existing.length > 0 ? await getNextId(config.table) : id;
        } else {
            itemId = await getNextId(config.table);
        }

        const contentName = config.table === tablesConfig.textbooks.table ? "content" : "text";
        const languagesJson = JSON.stringify(item.languages_and_technologies || []);

        await executeSQL(
            `INSERT INTO ${config.table} (
                id, 
                user_id, 
                title, 
                ${contentName}, 
                date, 
                sort_date, 
                time, 
                offline, 
                block_name, 
                languages_and_technologies
                ) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                itemId,
                item.user_id,
                item.title,
                (item as any)[contentName],
                item.date,
                item.sort_date,
                item.time,
                offline,
                name,
                languagesJson
            ]
        );

        return {...item, id: itemId};

    } catch (err) {
        await showError(
            'Ошибка создания записи',
            'Возникла ошибка создания записи в локальной базе данных..'
        )

        throw err
    }
};

export const redactItemInDB = async (
    name: string,
    item: Item,
    id: number,
    offline: string = ""
) => {
    const config = tablesConfig[name]

    const contentName = config.table === tablesConfig.textbooks.table ? "content" : "text"
    const languagesJson = JSON.stringify(item.languages_and_technologies || [])

    await executeSQL(
        `UPDATE ${config.table} SET
                title = ?, 
                ${contentName} = ?, 
                date = ?, 
                sort_date = ?, 
                time = ?, 
                offline = ?, 
                languages_and_technologies = ? 
              WHERE id = ?`,
        [item.title, (item as any)[contentName], item.date, item.sort_date, item.time, offline, languagesJson, id]
    )

    return {...item, id}
};

export const removeFromDB = async (
    name: string,
    id: number
) => {
    const config = tablesConfig[name]

    return executeSQL(`DELETE FROM ${config.table} WHERE id = ?`, [id])
}


export const checkPost = async (
    name: string
): Promise<boolean> => {
    const idStore = useIdStore()

    const config = tablesConfig[name]
    if (!config) return false

    const id = idStore.idValues[name]

    const item = await selectSQL<any>(`SELECT * FROM ${config.table} WHERE id = ?`, [id])

    return item.length > 0
}