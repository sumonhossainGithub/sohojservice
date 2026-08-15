import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { professionalProfiles, categories, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  categorySlug: z.string(),
  bio: z.string().max(500).optional().default(""),
  area: z.string().min(2),
  city: z.string().min(2).optional().default("Bangladesh"),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  ratePerVisit: z.coerce.number().int().min(0).optional(),
  photoUrl: z.string().url().or(z.literal("")).optional(),
  isAvailable: z.boolean().optional().default(true),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const profile = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.userId, user.id),
    with: {
      category: {
        columns: { id: true, slug: true, nameEn: true, nameBn: true },
      },
    },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your details." }, { status: 400 });
  }

  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, parsed.data.categorySlug),
  });
  if (!category) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  const existing = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.userId, user.id),
  });
  const account = await db.query.users.findFirst({ where: eq(users.id, user.id) });

  const values = {
    categoryId: category.id,
    bio: parsed.data.bio,
    area: parsed.data.area,
    city: parsed.data.city,
    yearsExperience: parsed.data.yearsExperience,
    ratePerVisit: parsed.data.ratePerVisit,
    isAvailable: parsed.data.isAvailable,
    latitude: account?.latitude ?? null,
    longitude: account?.longitude ?? null,
  };

  const photoValue = parsed.data.photoUrl || account?.photoUrl || null;

  if (existing) {
    const [updated] = await db
      .update(professionalProfiles)
      .set(parsed.data.photoUrl ? { ...values, photoUrl: parsed.data.photoUrl } : values)
      .where(eq(professionalProfiles.id, existing.id))
      .returning();
    return NextResponse.json({ id: updated.id });
  }

  const [created] = await db
    .insert(professionalProfiles)
    .values({ userId: user.id, ...values, photoUrl: photoValue })
    .returning();

  return NextResponse.json({ id: created.id });
}
