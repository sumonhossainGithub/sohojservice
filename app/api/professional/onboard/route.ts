import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { professionalProfiles, categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  categorySlug: z.string(),
  bio: z.string().max(500).optional().default(""),
  area: z.string().min(2),
  city: z.string().min(2).optional().default("Sirajganj"),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  ratePerVisit: z.coerce.number().int().min(0).optional(),
});

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

  const values = {
    categoryId: category.id,
    bio: parsed.data.bio,
    area: parsed.data.area,
    city: parsed.data.city,
    yearsExperience: parsed.data.yearsExperience,
    ratePerVisit: parsed.data.ratePerVisit,
  };

  if (existing) {
    const [updated] = await db
      .update(professionalProfiles)
      .set(values)
      .where(eq(professionalProfiles.id, existing.id))
      .returning();
    return NextResponse.json({ id: updated.id });
  }

  const [created] = await db
    .insert(professionalProfiles)
    .values({ userId: user.id, ...values })
    .returning();

  return NextResponse.json({ id: created.id });
}
