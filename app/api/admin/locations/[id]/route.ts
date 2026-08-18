import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { db } from "@/db";
import { serviceLocations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const updateLocationSchema = z.object({
  nameEn: z.string().min(1, "English name is required."),
  nameBn: z.string().min(1, "Bangla name is required."),
  district: z.string().min(1, "District / Jela is required."),
  division: z.string().default("Rajshahi"),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateLocationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid location data." },
        { status: 400 }
      );
    }

    const { nameEn, nameBn, district, division, lat, lng, isActive } = parsed.data;

    // Check if location already exists in DB
    const existing = await db.query.serviceLocations.findFirst({
      where: eq(serviceLocations.id, id),
    });

    if (existing) {
      const [updated] = await db
        .update(serviceLocations)
        .set({
          nameEn: nameEn.trim(),
          nameBn: nameBn.trim(),
          district: district.trim(),
          division: division.trim(),
          lat: lat !== undefined ? lat : existing.lat,
          lng: lng !== undefined ? lng : existing.lng,
          isActive: isActive !== undefined ? isActive : existing.isActive,
          updatedAt: new Date(),
        })
        .where(eq(serviceLocations.id, id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // If it was a static item being customized, insert it into the database table
      const [created] = await db
        .insert(serviceLocations)
        .values({
          id: createId(),
          nameEn: nameEn.trim(),
          nameBn: nameBn.trim(),
          district: district.trim(),
          division: division.trim(),
          lat: lat ?? null,
          lng: lng ?? null,
          isActive: isActive ?? true,
        })
        .returning();

      return NextResponse.json(created);
    }
  } catch (err: unknown) {
    console.error("Update location error:", err);
    return NextResponse.json(
      { error: "Failed to update location data." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  const { id } = await params;

  try {
    if (id.startsWith("static-")) {
      // Static base locations cannot be hard-deleted from DB, but we can return success
      return NextResponse.json({ message: "Default static location reset." });
    }

    await db.delete(serviceLocations).where(eq(serviceLocations.id, id));
    return NextResponse.json({ message: "Location deleted successfully." });
  } catch (err: unknown) {
    console.error("Delete location error:", err);
    return NextResponse.json({ error: "Failed to delete location." }, { status: 500 });
  }
}
