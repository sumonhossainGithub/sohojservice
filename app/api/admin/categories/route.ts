import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { db } from "@/db";
import { categories, professionalProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const createCategorySchema = z.object({
  nameEn: z.string().min(2, "English name is required."),
  nameBn: z.string().min(2, "Bangla name is required."),
  slug: z.string().min(2, "Slug is required."),
  icon: z.string().default("wrench"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  // Get all categories with count of registered professionals
  const allCategories = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      nameEn: categories.nameEn,
      nameBn: categories.nameBn,
      icon: categories.icon,
      proCount: sql<number>`cast(count(${professionalProfiles.id}) as int)`,
    })
    .from(categories)
    .leftJoin(professionalProfiles, eq(categories.id, professionalProfiles.categoryId))
    .groupBy(categories.id, categories.slug, categories.nameEn, categories.nameBn, categories.icon)
    .orderBy(asc(categories.nameEn));

  return NextResponse.json(allCategories);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid category data." },
        { status: 400 }
      );
    }

    const { nameEn, nameBn, slug, icon } = parsed.data;
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");

    // Check if slug already exists
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cleanSlug),
    });

    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists." },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(categories)
      .values({
        id: createId(),
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim(),
        slug: cleanSlug,
        icon: icon.trim() || "wrench",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("Create category error:", err);
    return NextResponse.json(
      { error: "Failed to create category. Please try again." },
      { status: 500 }
    );
  }
}
