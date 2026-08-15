import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function GET() {
  const all = await db.select().from(categories).orderBy(asc(categories.nameEn));
  return NextResponse.json(all);
}
