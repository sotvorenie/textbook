import Database from "@tauri-apps/plugin-sql";
import { appLocalDataDir, join } from "@tauri-apps/api/path";

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

export const initDB = async () => {
    await executeSQL(`
    CREATE TABLE IF NOT EXISTS technologies (
      id INTEGER PRIMARY KEY,
      title TEXT
    )
  `);

    await executeSQL(`
    CREATE TABLE IF NOT EXISTS advices (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      title TEXT,
      text TEXT,
      date TEXT,
      sort_date TEXT,
      time TEXT,
      offline TEXT
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
      offline TEXT
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
      offline TEXT
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
      offline TEXT
    )
  `);

    const techRelations = [
        { table: "advice_technologies", parent: "advices", field: "advice_id" },
        { table: "project_technologies", parent: "projects", field: "project_id" },
        { table: "post_technologies", parent: "posts", field: "post_id" },
        { table: "textbook_technologies", parent: "textbooks", field: "textbook_id" },
    ];

    for (const rel of techRelations) {
        await executeSQL(`
      CREATE TABLE IF NOT EXISTS ${rel.table} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${rel.field} INTEGER NOT NULL,
        technology_id INTEGER NOT NULL,
        FOREIGN KEY (${rel.field}) REFERENCES ${rel.parent}(id) ON DELETE CASCADE,
        FOREIGN KEY (technology_id) REFERENCES technologies(id) ON DELETE CASCADE,
        UNIQUE(${rel.field}, technology_id)
      )
    `);
    }
};