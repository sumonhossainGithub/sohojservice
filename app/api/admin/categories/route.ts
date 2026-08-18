import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
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
  try {
    const allCategories = await db.select().from(categories).orderBy(asc(categories.nameEn));
    const proProfiles = await db.select({ categoryId: professionalProfiles.categoryId }).from(professionalProfiles);

    const counts: Record<string, number> = {};
    for (const p of proProfiles) {
      if (p.categoryId) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    }

    const result = allCategories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameEn: cat.nameEn,
      nameBn: cat.nameBn,
      icon: cat.icon || "wrench",
      proCount: counts[cat.id] || 0,
    }));

    return NextResponse.json(result);
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

    return NextResponse.json(
      {
        id: created.id,
        slug: created.slug,
        nameEn: created.nameEn,
        nameBn: created.nameBn,
        icon: created.icon,
        proCount: 0,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Create category error:", err);
    return NextResponse.json(
      { error: "Failed to create category. Please check your inputs and try again." },
      { status: 500 }
    );
  }
}
