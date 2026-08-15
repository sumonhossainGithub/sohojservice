import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, professionalProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const professional = await db.query.professionalProfiles.findFirst({
    where: eq(professionalProfiles.id, booking.professionalId),
  });

  const isOwningProfessional =
    user.role === "PROFESSIONAL" && professional?.userId === user.id;
  const isOwningCustomer = user.role === "CUSTOMER" && booking.customerId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isAdmin && (
    (["ACCEPTED", "DECLINED", "COMPLETED"].includes(parsed.data.status) &&
      !isOwningProfessional) ||
    (parsed.data.status === "CANCELLED" && !isOwningCustomer && !isOwningProfessional)
  )) {
    return NextResponse.json({ error: "Not authorized for this action." }, { status: 403 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(bookings.id, id))
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
  const booking = await db.query.bookings.findFirst({ where: eq(bookings.id, id) });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  await db.delete(bookings).where(eq(bookings.id, id));
  return NextResponse.json({ ok: true });
}
