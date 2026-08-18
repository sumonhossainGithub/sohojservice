import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceLocations } from "@/db/schema";
import { BANGLADESH_LOCATIONS, BDLocation, findNearestLocation } from "@/lib/locations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    // Fetch active custom locations from Neon DB
    let dbLocations: BDLocation[] = [];
    try {
      const records = await db
        .select()
        .from(serviceLocations)
        .where(eq(serviceLocations.isActive, true))
        .orderBy(asc(serviceLocations.nameEn));

      dbLocations = records.map((r) => ({
        nameEn: r.nameEn,
        nameBn: r.nameBn,
        district: r.district,
        division: r.division,
        lat: r.lat ?? undefined,
        lng: r.lng ?? undefined,
      }));
    } catch {
      // If DB read fails, fallback to static records
    }

    // Merge: DB items take precedence over static items with same nameEn
    const dbMap = new Map(dbLocations.map((l) => [l.nameEn.toLowerCase(), l]));
    const mergedList: BDLocation[] = [
      ...dbLocations,
      ...BANGLADESH_LOCATIONS.filter((l) => !dbMap.has(l.nameEn.toLowerCase())),
    ];

    // Reverse Geolocation Service: Resolve coordinates to nearest Bangladesh location
    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (!isNaN(lat) && !isNaN(lng)) {
        const nearest = findNearestLocation(lat, lng, mergedList);
        if (nearest) {
          return NextResponse.json(
            {
              nearest: nearest.location,
              distanceKm: Math.round(nearest.distanceKm * 10) / 10,
            },
            {
              headers: {
                "Cache-Control": "private, no-cache",
              },
            }
          );
        }
      }
    }

    // Default: Return the comprehensive list of all Bangladesh locations
    return NextResponse.json(
      {
        locations: mergedList,
        total: mergedList.length,
        coverage: "Bangladesh (64 Districts & Upazilas)",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({
      locations: BANGLADESH_LOCATIONS,
      total: BANGLADESH_LOCATIONS.length,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
