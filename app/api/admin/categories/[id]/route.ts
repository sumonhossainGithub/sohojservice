import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, professionalProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const updateCategorySchema = z.object({
  nameEn: z.string().min(2).optional(),
  nameBn: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  icon: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update data." }, { status: 400 });
    }

    const updates: Partial<{
      nameEn: string;
      nameBn: string;
      slug: string;
      icon: string;
    }> = {};

    if (parsed.data.nameEn) updates.nameEn = parsed.data.nameEn.trim();
    if (parsed.data.nameBn) updates.nameBn = parsed.data.nameBn.trim();
    if (parsed.data.icon) updates.icon = parsed.data.icon.trim();
    if (parsed.data.slug) {
      const cleanSlug = parsed.data.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
      // Check if new slug is taken by another category
      const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, cleanSlug),
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "Another category is already using this slug." },
          { status: 409 }
        );
      }
      updates.slug = cleanSlug;
    }

    const [updated] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error("Update category error:", err);
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Check if any professionals are currently linked to this category
    const proInCat = await db.query.professionalProfiles.findFirst({
      where: eq(professionalProfiles.categoryId, id),
    });

    if (proInCat) {
      return NextResponse.json(
        {
          error:
            "Cannot delete this category because there are active professionals registered under it. Please reassign them first.",
        },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: deleted.id });
  } catch (err: unknown) {
    console.error("Delete category error:", err);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
