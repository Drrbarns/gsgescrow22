import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env, isDbLive } from "../env";

declare global {
  var __sbbs_db_sql__: ReturnType<typeof postgres> | undefined;
}

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!isDbLive) {
    throw new Error(
      "Database is not configured. Set DATABASE_URL in .env.local before calling getDb().",
    );
  }
  if (_db) return _db;
  const client =
    global.__sbbs_db_sql__ ??
    postgres(env.DATABASE_URL!, {
      max: 10,
      prepare: false,
    });
  if (process.env.NODE_ENV !== "production") {
    global.__sbbs_db_sql__ = client;
  }
  _db = drizzle(client, { schema });
  return _db;
}

export type Db = ReturnType<typeof getDb>;
export { schema };
