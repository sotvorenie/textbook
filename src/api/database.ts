import Database from "@tauri-apps/plugin-sql";
import { appLocalDataDir, join } from "@tauri-apps/api/path";
import useUserStore from "../store/useUserStore.ts";
import useOnlineStore from "../store/useOnlineStore.ts";

export const tablesConfig: Record<string, Record<string, string>> = {
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
    hints: {
        table: "hints",
        techTable: "post_technologies",
        idField: "post_id",
    },
    textbooks: {
        table: "textbooks",
        techTable: "textbook_technologies",
        idField: "textbook_id",
    },
};

const DB_NAME = "veBook.db";

let db: Database | null = null;

export const openDB = async () => {
    const onlineStore = useOnlineStore();

    try {
        if (db) return db;

        const dir = await appLocalDataDir();
        const dbPath = await join(dir, DB_NAME);
        const url = `sqlite://${dbPath.replace(/\\/g, "/")}`;

        db = await Database.load(url);
        return db;
    } catch (err) {
        onlineStore.isDBActive = false

        throw err
    }
};

export const executeSQL = async (sql: string, values: any[] = []) => {
    try {
        const database = await openDB();
        await database.execute(sql, values);
    } catch (err) {
        throw err
    }
};

export const selectSQL = async <T = any>(
    sql: string,
    values: any[] = []
): Promise<T[]> => {
    try {
        const database = await openDB();
        return database.select<T[]>(sql, values);
    } catch (err) {
        throw err
    }
};

export const removeOffline = async (name: string, id: number, newItemId?: number): Promise<void> => {
    const userStore = useUserStore()

    try {
        const config = tablesConfig[name];

        const sets: string[] = ["offline = ''", "user_id = ?"]
        const values: any[] = [userStore.user.id]

        if (newItemId) {
            sets.push('id = ?')
            values.push(newItemId)
        }

        values.push(id)

        return await executeSQL(
            `UPDATE ${config.table} SET ${sets.join(', ')} WHERE id = ?`,
            values
        );
    } catch (err) {
        throw err
    }
}

export const initDB = async () => {
    await executeSQL(`
    CREATE TABLE IF NOT EXISTS advices (
      id INTEGER,
      user_id INTEGER,
      title TEXT,
      text TEXT,
      date TEXT,
      sort_date TEXT,
      time TEXT,
      offline TEXT,
      block_name TEXT,
      languages_and_technologies TEXT
    )
  `);

    await executeSQL(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER,
      user_id INTEGER,
      title TEXT,
      text TEXT,
      date TEXT,
      sort_date TEXT,
      time TEXT,
      offline TEXT,
      block_name TEXT,
      languages_and_technologies TEXT
    )
  `);

    await executeSQL(`
    CREATE TABLE IF NOT EXISTS hints (
      id INTEGER,
      user_id INTEGER,
      title TEXT,
      text TEXT,
      date TEXT,
      sort_date TEXT,
      time TEXT,
      offline TEXT,
      block_name TEXT,
      languages_and_technologies TEXT
    )
  `);

    await executeSQL(`
    CREATE TABLE IF NOT EXISTS textbooks (
      id INTEGER,
      user_id INTEGER,
      title TEXT,
      content TEXT,
      date TEXT,
      sort_date TEXT,
      time TEXT,
      offline TEXT,
      block_name TEXT,
      languages_and_technologies TEXT
    )
  `);
};