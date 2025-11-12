import {del, get, patch, post} from "../base.ts";
import {List} from "../../types/list.ts";
import {Item} from "../../types/item.ts";
import {GetList} from "./types.ts";
import {executeSQL, selectSQL} from "../database.ts";
import useOnlineStore from "../../store/useOnlineStore.ts";

const tablesConfig: Record<string, Record<string, string>> = {
    advices: {
        table: "advices",
        techTable: "advice_technologies",
        idField: "advice_id",
    },
    projects: {
        table: "projects",
        techTable: "project_technologies",
        idField: "project_id",
    },
    posts: {
        table: "posts",
        techTable: "post_technologies",
        idField: "post_id",
    },
    textbooks: {
        table: "textbooks",
        techTable: "textbook_technologies",
        idField: "textbook_id",
    },
};

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

    try {
        if (onlineStore.isOnlineMode) {
            const params: GetList = {
                _select: "id,title,languages_and_technologies,date",
                page,
                limit: 9,
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

const getListFromDB = async (
    name: string,
    page: number,
    value: string = "",
    languages: string[] = [],
    user_id: number | null,
    sortBy: string = "-sort_date",
    id: number[] = []
): Promise<{ meta: any; items: List[] }> => {
    const config = tablesConfig[name];
    if (!config) throw new Error(`Неизвестная таблица: ${name}`);

    const limit = 9;
    const offset = (page - 1) * limit;

    const whereParts: string[] = [];
    const params: any[] = [];

    if (languages.length) {
        whereParts.push(
            `id IN (
                SELECT ${config.idField}
                FROM ${config.techTable} t
                JOIN technologies tech ON t.technology_id = tech.id
                WHERE tech.title IN (${languages.map(() => "?").join(",")})
            )`
        );
        params.push(...languages);
    }

    if (user_id !== null && user_id !== undefined) {
        whereParts.push(`${config.table}.user_id = ?`);
        params.push(user_id);
    }

    if (value) {
        whereParts.push(`${config.table}.title LIKE ?`);
        params.push(`%${value}%`);
    }

    if (id && id.length > 0) {
        whereParts.push(`${config.table}.id IN (${id.map(() => "?").join(",")})`);
        params.push(...id);
    }

    const where = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
    const sortName = sortBy.replace("-", "");
    const sortOrder = sortBy.startsWith("-") ? "DESC" : "ASC";

    const items = await selectSQL<List>(
        `
        SELECT *
        FROM ${config.table}
        ${where}
        ORDER BY ${sortName} ${sortOrder}
        LIMIT ? OFFSET ?
    `,
        [...params, limit, offset]
    );

    for (const item of items) {
        const techRows = await selectSQL<{ title: string }>(
            `
          SELECT tech.title
          FROM ${config.techTable} t
          JOIN technologies tech ON t.technology_id = tech.id
          WHERE t.${config.idField} = ?
      `,
            [item.id]
        );
        item.languages_and_technologies = techRows.map((t) => t.title);
    }

    const countRows = await selectSQL<{ total: number }>(
        `
        SELECT COUNT(DISTINCT id) AS total
        FROM ${config.table}
        ${where}
    `,
        params
    );

    const total = countRows[0]?.total ?? 0;

    const meta = {
        current_page: page,
        from: total === 0 ? 0 : offset + 1,
        to: Math.min(offset + limit, total),
        total,
        per_page: limit,
        last_page: Math.ceil(total / limit),
    };

    return { meta, items };
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

const getItemFromDB = async (name: string, id: number): Promise<Item> => {
    const config = tablesConfig[name];
    if (!config) throw new Error(`Неизвестная таблица: ${name}`);

    const items = await selectSQL<Item>(`SELECT * FROM ${config.table} WHERE id = ?`, [id]);
    if (items.length === 0) throw new Error(`Запись не найдена: ${name}`);

    const item = items[0];
    const techRows = await selectSQL<{ title: string }>(
        `
        SELECT tech.title
        FROM ${config.techTable} t
        JOIN technologies tech ON t.technology_id = tech.id
        WHERE t.${config.idField} = ?
    `,
        [id]
    );

    item.languages_and_technologies = techRows.map((t) => t.title);
    return item;
};

export const createItem = async (name: string, item: Item): Promise<Item> => {
    const onlineStore = useOnlineStore();

    console.log(item)

    try {
        if (onlineStore.isOnlineMode) {
            const createdItem = await post(`/${name}`, item) as Item
            await createItemInDB(name, item, createdItem.id as number);
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

const createItemInDB = async (name: string, item: Item, id: number = -1, offline: string = "") => {
    const config = tablesConfig[name];
    if (!config) throw new Error(`Неизвестная таблица: ${name}`);

    const contentName = config.table === tablesConfig.textbooks.table ? "content" : "text";

    let itemId: number;
    if (id >= 0) {
        itemId = id;
    } else {
        const result: any = await executeSQL(`SELECT id FROM ${config.table} ORDER BY id DESC LIMIT 1`);
        const lastItem = Array.isArray(result) ? result[0] : result?.rows?.[0] || result;
        itemId = (lastItem?.id || 0) + 1;
    }

    const sql = `
        INSERT INTO ${config.table} (
          id, user_id, title, ${contentName}, date, sort_date, time, offline
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        itemId,
        item.user_id,
        item.title,
        (item as any)[contentName],
        item.date,
        item.sort_date,
        item.time,
        offline,
    ];

    await executeSQL(sql, values);

    return {...item, id: itemId};
};

export const redactItem = async (name: string, item: Item, id: number): Promise<any> => {
    const onlineStore = useOnlineStore();

    try {
        if (onlineStore.isOnlineMode) {
            await redactItemInDB(name, item, id);
            return await patch(`/${name}/${id}`, item);
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

const redactItemInDB = async (
    name: string,
    item: Item,
    id: number,
    offline: string = ""
) => {
    const config = tablesConfig[name];
    if (!config) throw new Error(`Неизвестная таблица: ${name}`);

    const contentName = config.table === tablesConfig.textbooks.table ? "content" : "text";

    const sql = `
        UPDATE ${config.table}
        SET
          user_id = ?,
          title = ?,
          ${contentName} = ?,
          date = ?,
          sort_date = ?,
          time = ?,
          offline = ?
        WHERE id = ?
    `;

    const values = [
        item.user_id,
        item.title,
        (item as any)[contentName],
        item.date,
        item.sort_date,
        item.time,
        offline,
        id,
    ];

    try {
        await executeSQL(sql, values);

        return {...item, id}
    } catch (error) {
        console.error('ExecuteSQL error:', error);
        throw error;
    }
};

export const removeItem = async (name: string, id: number): Promise<any> => {
    const onlineStore = useOnlineStore();

    try {
        if (onlineStore.isOnlineMode) {
            await del(`/${name}/${id}`);
            await removeFromDB(name, id);
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

const removeFromDB = async (name: string, id: number) => {
    const config = tablesConfig[name];
    if (!config) throw new Error(`Неизвестная таблица: ${name}`);

    await executeSQL(
        `DELETE FROM ${config.techTable} WHERE ${config.idField} = ?`,
        [id]
    );

    return await executeSQL(`DELETE FROM ${config.table} WHERE id = ?`, [id]);
};
