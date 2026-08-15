import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  bookingId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional().default(""),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  }

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, parsed.data.bookingId),
  });
  if (!booking || booking.customerId !== user.id) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "You can only review completed bookings." },
      { status: 400 }
    );
  }

  const [review] = await db
    .insert(reviews)
    .values({
      bookingId: booking.id,
      authorId: user.id,
      professionalId: booking.professionalId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    })
    .returning();

  return NextResponse.json(review);
}
