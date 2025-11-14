import Database from "@tauri-apps/plugin-sql";
import { appLocalDataDir, join } from "@tauri-apps/api/path";

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

const DB_NAME = "veBook.db";

let db: Database | null = null;

export const openDB = async () => {
    if (db) return db;

    const dir = await appLocalDataDir();
    const dbPath = await join(dir, DB_NAME);
    const url = `sqlite://${dbPath.replace(/\\/g, "/")}`;

    db = await Database.load(url);
    return db;
};

export const executeSQL = async (sql: string, values: any[] = []) => {
    const database = await openDB();
    await database.execute(sql, values);
};

export const selectSQL = async <T = any>(
    sql: string,
    values: any[] = []
): Promise<T[]> => {
    const database = await openDB();
    return database.select<T[]>(sql, values);
};

export const removeOffline = async (name: string, id: number): Promise<void> => {
    const config = tablesConfig[name];
    if (!config) throw new Error(`Неизвестная таблица: ${name}`);

    return await executeSQL(
        `UPDATE ${config.table} SET offline = '' WHERE id = ?`,
        [id]
    );
}

export const initDB = async () => {
    await executeSQL(`
    CREATE TABLE IF NOT EXISTS advices (
      id INTEGER PRIMARY KEY,
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
      id INTEGER PRIMARY KEY,
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
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY,
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
      id INTEGER PRIMARY KEY,
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