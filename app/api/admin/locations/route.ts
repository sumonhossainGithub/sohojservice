import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { db } from "@/db";
import { serviceLocations } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { BANGLADESH_LOCATIONS } from "@/lib/locations";

const locationSchema = z.object({
  nameEn: z.string().min(1, "English location/area name is required."),
  nameBn: z.string().min(1, "Bangla location/area name is required."),
  district: z.string().min(1, "District / Jela is required."),
  division: z.string().default("Rajshahi"),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const dbLocs = await db.select().from(serviceLocations).orderBy(asc(serviceLocations.nameEn));

    // Combine base locations with DB locations, with DB records overriding base static records
    const dbNames = new Set(dbLocs.map((l) => l.nameEn.toLowerCase()));
    const staticItems = BANGLADESH_LOCATIONS.filter(
      (l) => !dbNames.has(l.nameEn.toLowerCase())
    ).map((l, index) => ({
      id: `static-${index + 1}`,
      nameEn: l.nameEn,
      nameBn: l.nameBn,
      district: l.district,
      division: l.division || "Rajshahi",
      lat: l.lat ?? null,
      lng: l.lng ?? null,
      isActive: true,
      isCustom: false,
      createdAt: new Date().toISOString(),
    }));

    const formattedDbLocs = dbLocs.map((l) => ({
      id: l.id,
      nameEn: l.nameEn,
      nameBn: l.nameBn,
      district: l.district,
      division: l.division,
      lat: l.lat ?? null,
      lng: l.lng ?? null,
      isActive: l.isActive,
      isCustom: true,
      createdAt: l.createdAt.toISOString(),
    }));

    const all = [...formattedDbLocs, ...staticItems];

    return NextResponse.json({
      locations: all,
      total: all.length,
      customCount: formattedDbLocs.length,
    });
  } catch (err: unknown) {
    console.error("Fetch admin locations error:", err);
    return NextResponse.json({ error: "Failed to load locations." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = locationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid location data." },
        { status: 400 }
      );
    }

    const { nameEn, nameBn, district, division, lat, lng, isActive } = parsed.data;

    const [created] = await db
      .insert(serviceLocations)
      .values({
        id: createId(),
        nameEn: nameEn.trim(),
        nameBn: nameBn.trim(),
        district: district.trim(),
        division: division.trim() || "Rajshahi",
        lat: lat ?? null,
        lng: lng ?? null,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(
      {
        id: created.id,
        nameEn: created.nameEn,
        nameBn: created.nameBn,
        district: created.district,
        division: created.division,
        lat: created.lat,
        lng: created.lng,
        isActive: created.isActive,
        isCustom: true,
        createdAt: created.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Create location error:", err);
    return NextResponse.json(
      { error: "Failed to add location. Please check your inputs and try again." },
      { status: 500 }
    );
  }
}
