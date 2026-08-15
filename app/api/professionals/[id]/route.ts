import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { professionalProfiles, users, categories, reviews } from "@/db/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
      photoUrl: professionalProfiles.photoUrl,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(professionalProfiles.userId, users.id))
    .innerJoin(categories, eq(professionalProfiles.categoryId, categories.id))
    .where(eq(professionalProfiles.id, id))
    .limit(1);

  const p = rows[0];
  if (!p) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const profReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      authorName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.authorId, users.id))
    .where(eq(reviews.professionalId, id))
    .orderBy(desc(reviews.createdAt));

  const ratings = profReviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  return NextResponse.json({
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
    photoUrl: p.photoUrl,
    avgRating,
    reviews: profReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      author: r.authorName,
      createdAt: r.createdAt,
    })),
  });
}
