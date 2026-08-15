import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, professionalProfiles, users, categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  professionalId: z.string(),
  problemNote: z.string().min(5).max(500),
  address: z.string().min(5).max(300),
  preferredDate: z.string(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json(
      { error: "Please log in as a customer to book." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your booking details." }, { status: 400 });
  }

  const [booking] = await db
    .insert(bookings)
    .values({
      customerId: user.id,
      professionalId: parsed.data.professionalId,
      problemNote: parsed.data.problemNote,
      address: parsed.data.address,
      preferredDate: new Date(parsed.data.preferredDate),
    })
    .returning();

  return NextResponse.json({ id: booking.id });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  if (user.role === "CUSTOMER") {
    const rows = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        problemNote: bookings.problemNote,
        address: bookings.address,
        preferredDate: bookings.preferredDate,
        proName: users.name,
        proCategoryEn: categories.nameEn,
      })
      .from(bookings)
      .innerJoin(professionalProfiles, eq(bookings.professionalId, professionalProfiles.id))
      .innerJoin(users, eq(professionalProfiles.userId, users.id))
      .innerJoin(categories, eq(professionalProfiles.categoryId, categories.id))
      .where(eq(bookings.customerId, user.id))
      .orderBy(bookings.createdAt);

    return NextResponse.json(
      rows.map((b) => ({
        id: b.id,
        status: b.status,
        problemNote: b.problemNote,
        address: b.address,
        preferredDate: b.preferredDate,
        professional: { user: { name: b.proName }, category: { nameEn: b.proCategoryEn } },
      }))
    );
  }

  if (user.role === "PROFESSIONAL") {
    const profile = await db.query.professionalProfiles.findFirst({
      where: eq(professionalProfiles.userId, user.id),
    });
    if (!profile) return NextResponse.json([]);

    const rows = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        problemNote: bookings.problemNote,
        address: bookings.address,
        preferredDate: bookings.preferredDate,
        customerName: users.name,
        customerPhone: users.phone,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.customerId, users.id))
      .where(eq(bookings.professionalId, profile.id))
      .orderBy(bookings.createdAt);

    return NextResponse.json(
      rows.map((b) => ({
        id: b.id,
        status: b.status,
        problemNote: b.problemNote,
        address: b.address,
        preferredDate: b.preferredDate,
        customer: { name: b.customerName, phone: b.customerPhone },
      }))
    );
  }

  return NextResponse.json({ error: "Not authorized." }, { status: 401 });
}
