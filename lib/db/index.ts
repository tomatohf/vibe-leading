import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { db: ReturnType<typeof createDb> };

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env (see .env.example)."
    );
  }
  const pool = mysql.createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  return drizzle(pool, { schema, mode: "default" });
}

/**
 * Drizzle DB client. Singleton per process to avoid connection exhaustion
 * (dev hot reload + serverless cold starts).
 */
export const db = globalForDb.db ??= createDb();

export type Db = typeof db;
