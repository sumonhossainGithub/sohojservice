import { NextResponse } from "next/server";
import { db } from "@/db";
import { instantBookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, assignedProfessionalId, adminNotes } = body;

    const updateData: Partial<typeof instantBookings.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (assignedProfessionalId !== undefined) updateData.assignedProfessionalId = assignedProfessionalId || null;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const [updated] = await db
      .update(instantBookings)
      .set(updateData)
      .where(eq(instantBookings.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Instant booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Instant booking update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update instant booking." },
      { status: 500 }
    );
  }
}
