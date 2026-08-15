import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string."
  );
}

const sql = neon(process.env.DATABASE_URL);

// Drizzle client, used everywhere the app talks to the database.
// Works identically in Node.js API routes and in Edge middleware,
// because the underlying driver talks to Neon over plain HTTPS.
export const db = drizzle(sql, { schema });
