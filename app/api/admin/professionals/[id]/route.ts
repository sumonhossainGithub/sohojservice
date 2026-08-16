import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, categories, professionalProfiles, reviews, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const patchSchema = z.object({
  isVerified: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  area: z.string().min(2).max(120).optional(),
  city: z.string().min(2).max(120).optional(),
  bio: z.string().max(500).optional(),
  yearsExperience: z.number().min(0).max(60).optional(),
  ratePerVisit: z.number().min(0).nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;
  const rows = await db
    .select({
      id: professionalProfiles.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      accountPhotoUrl: users.photoUrl,
      categorySlug: categories.slug,
      categoryNameEn: categories.nameEn,
      categoryNameBn: categories.nameBn,
      bio: professionalProfiles.bio,
      area: professionalProfiles.area,
      city: professionalProfiles.city,
      yearsExperience: professionalProfiles.yearsExperience,
      ratePerVisit: professionalProfiles.ratePerVisit,
      isVerified: professionalProfiles.isVerified,
      isAvailable: professionalProfiles.isAvailable,
      listingPhotoUrl: professionalProfiles.photoUrl,
      latitude: professionalProfiles.latitude,
      longitude: professionalProfiles.longitude,
      createdAt: professionalProfiles.createdAt,
    })
    .from(professionalProfiles)
    .innerJoin(users, eq(professionalProfiles.userId, users.id))
    .innerJoin(categories, eq(professionalProfiles.categoryId, categories.id))
    .where(eq(professionalProfiles.id, id))
    .limit(1);

  const profile = rows[0];
  if (!profile) {
    return NextResponse.json({ error: "Professional listing not found." }, { status: 404 });
  }

  const bookingRows = await db
    .select({ status: bookings.status })
    .from(bookings)
    .where(eq(bookings.professionalId, id));
  const reviewRows = await db
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(eq(reviews.professionalId, id));

  const completedBookings = bookingRows.filter((b) => b.status === "COMPLETED").length;
  const avgRating =
    reviewRows.length > 0
      ? reviewRows.reduce((sum, row) => sum + row.rating, 0) / reviewRows.length
      : null;

  return NextResponse.json({
    id: profile.id,
    user: {
      id: profile.userId,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      photoUrl: profile.accountPhotoUrl,
    },
    category: {
      slug: profile.categorySlug,
      nameEn: profile.categoryNameEn,
      nameBn: profile.categoryNameBn,
    },
    bio: profile.bio,
    area: profile.area,
    city: profile.city,
    yearsExperience: profile.yearsExperience,
    ratePerVisit: profile.ratePerVisit,
    isVerified: profile.isVerified,
    isAvailable: profile.isAvailable,
    photoUrl: profile.listingPhotoUrl ?? profile.accountPhotoUrl,
    listingPhotoUrl: profile.listingPhotoUrl,
    accountPhotoUrl: profile.accountPhotoUrl,
    latitude: profile.latitude,
    longitude: profile.longitude,
    createdAt: profile.createdAt,
    stats: {
      totalBookings: bookingRows.length,
      completedBookings,
      reviewCount: reviewRows.length,
      avgRating,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const existing = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.id, id),
  });
  if (!existing) {
    return NextResponse.json({ error: "Professional listing not found." }, { status: 404 });
  }

  const [updated] = await db
    .update(professionalProfiles)
    .set(parsed.data)
    .where(eq(professionalProfiles.id, id))
    .returning();

  return NextResponse.json(updated);
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
  const existing = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.id, id),
  });
  if (!existing) {
    return NextResponse.json({ error: "Professional listing not found." }, { status: 404 });
  }

  await db.delete(professionalProfiles).where(eq(professionalProfiles.id, id));
  return NextResponse.json({ ok: true });
}
