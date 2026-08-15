import { NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, professionalProfiles, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  professionalId: z.string().optional(),
  bookingId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional().default(""),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Only registered users can submit ratings. Please log in or sign up first." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid rating. Please select between 1 and 5 stars." },
      { status: 400 }
    );
  }

  let targetProfessionalId = parsed.data.professionalId;
  const targetBookingId = parsed.data.bookingId;

  if (targetBookingId) {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, targetBookingId),
    });
    if (!booking || (booking.customerId !== user.id && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Booking not found or unauthorized." }, { status: 404 });
    }
    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You can only review completed bookings." },
        { status: 400 }
      );
    }
    targetProfessionalId = booking.professionalId;
  }

  if (!targetProfessionalId) {
    return NextResponse.json({ error: "Professional ID is required." }, { status: 400 });
  }

  const professional = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.id, targetProfessionalId),
  });

  if (!professional) {
    return NextResponse.json({ error: "Professional not found." }, { status: 404 });
  }

  // Prevent rating own profile
  if (professional.userId === user.id) {
    return NextResponse.json(
      { error: "You cannot rate your own professional profile." },
      { status: 400 }
    );
  }

  // Check if this registered user has already rated this professional
  const existingReview = await db.query.reviews.findFirst({
    where: and(
      eq(reviews.authorId, user.id),
      eq(reviews.professionalId, targetProfessionalId)
    ),
  });

  if (existingReview) {
    const [updated] = await db
      .update(reviews)
      .set({
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        ...(targetBookingId ? { bookingId: targetBookingId } : {}),
      })
      .where(eq(reviews.id, existingReview.id))
      .returning();

    return NextResponse.json({ ...updated, isUpdated: true });
  }

  const [review] = await db
    .insert(reviews)
    .values({
      bookingId: targetBookingId || null,
      authorId: user.id,
      professionalId: targetProfessionalId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    })
    .returning();

  return NextResponse.json(review);
}
