import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const DEFAULT_DATABASE_URL =
  "postgresql://neondb_owner:npg_Q9yqgH7oZTJA@ep-still-sunset-azcxq4k6-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

const sql = neon(connectionString);

// Drizzle client, used everywhere the app talks to the database.
export const db = drizzle(sql, { schema });
