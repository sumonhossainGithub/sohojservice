import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or, inArray } from "drizzle-orm";
import { db } from "@/db";
import { professionalProfiles, users, categories, reviews } from "@/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category") ?? undefined;
  const area = searchParams.get("area") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const available = searchParams.get("available") === "true";

  const conditions = [];
  if (area) conditions.push(ilike(professionalProfiles.area, `%${area}%`));
  if (categorySlug) conditions.push(eq(categories.slug, categorySlug));
  if (q) {
    conditions.push(
      or(
        ilike(users.name, `%${q}%`),
        ilike(professionalProfiles.bio, `%${q}%`),
        ilike(categories.nameEn, `%${q}%`)
      )
    );
  }
  if (available) conditions.push(eq(professionalProfiles.isAvailable, true));

  const rows = await db
    .select({
      id: professionalProfiles.id,
      name: users.name,
      categorySlug: categories.slug,
      categoryNameEn: categories.nameEn,
      categoryNameBn: categories.nameBn,
      area: professionalProfiles.area,
      city: professionalProfiles.city,
      bio: professionalProfiles.bio,
      yearsExperience: professionalProfiles.yearsExperience,
      ratePerVisit: professionalProfiles.ratePerVisit,
      isVerified: professionalProfiles.isVerified,
      isAvailable: professionalProfiles.isAvailable,
      listingPhotoUrl: professionalProfiles.photoUrl,
      accountPhotoUrl: users.photoUrl,
      latitude: professionalProfiles.latitude,
      longitude: professionalProfiles.longitude,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(professionalProfiles.userId, users.id))
    .innerJoin(categories, eq(professionalProfiles.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(professionalProfiles.isVerified), desc(professionalProfiles.createdAt));

  const ids = rows.map((r) => r.id);
  const allReviews = ids.length
    ? await db
        .select({ professionalId: reviews.professionalId, rating: reviews.rating })
        .from(reviews)
        .where(inArray(reviews.professionalId, ids))
    : [];

  const shaped = rows.map((p) => {
    const ratings = allReviews
      .filter((r) => r.professionalId === p.id)
      .map((r) => r.rating);
    const avgRating =
      ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

    return {
      id: p.id,
      name: p.name,
      category: { slug: p.categorySlug, nameEn: p.categoryNameEn, nameBn: p.categoryNameBn },
      area: p.area,
      city: p.city,
      bio: p.bio,
      yearsExperience: p.yearsExperience,
      ratePerVisit: p.ratePerVisit,
      isVerified: p.isVerified,
      isAvailable: p.isAvailable,
      photoUrl: p.listingPhotoUrl ?? p.accountPhotoUrl,
      latitude: p.latitude,
      longitude: p.longitude,
      avgRating,
      reviewCount: ratings.length,
    };
  });

  return NextResponse.json(shaped);
}
