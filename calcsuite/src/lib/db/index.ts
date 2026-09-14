// Database connection using Drizzle ORM with PostgreSQL
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/calcsuite";

// For development, allow running without a database
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

try {
  client = postgres(connectionString, { max: 1 });
  db = drizzle(client, { schema });
} catch (error) {
  console.warn("Database connection failed. Running without database:", error);
}

export { db, schema };
export type Database = typeof db;
