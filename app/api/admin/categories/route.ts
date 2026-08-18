import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { db } from "@/db";
import { categories, professionalProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const createCategorySchema = z.object({
  nameEn: z.string().min(1, "English name is required."),
  nameBn: z.string().min(1, "Bangla name is required."),
  slug: z.string().optional().nullable(),
  icon: z.string().optional().nullable().default("wrench"),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  try {
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
  } catch (err) {
    console.error("Fetch categories error:", err);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
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

    // Generate clean slug from slug or English name
    let cleanSlug = (slug && slug.trim().length > 0 ? slug : nameEn)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!cleanSlug || cleanSlug.length < 2) {
      cleanSlug = `service-${Date.now().toString(36)}`;
    }

    // Check if slug already exists; if so, make it unique with a suffix
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, cleanSlug),
    });

    if (existing) {
      cleanSlug = `${cleanSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const [created] = await db
      .insert(categories)
      .values({
        id: createId(),
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim(),
        slug: cleanSlug,
        icon: icon?.trim() || "wrench",
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("Create category error:", err);
    return NextResponse.json(
      { error: "Failed to create category. Please check your inputs and try again." },
      { status: 500 }
    );
  }
}
