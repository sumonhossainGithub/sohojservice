import { NextResponse } from "next/server";
import { BANGLADESH_LOCATIONS, findNearestLocation } from "@/lib/locations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    // Reverse Geolocation Service: Resolve coordinates to nearest Bangladesh location
    if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (!isNaN(lat) && !isNaN(lng)) {
        const nearest = findNearestLocation(lat, lng);
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

    // Default: Return the comprehensive list of all Bangladesh locations with caching
    return NextResponse.json(
      {
        locations: BANGLADESH_LOCATIONS,
        total: BANGLADESH_LOCATIONS.length,
        coverage: "Bangladesh (64 Districts & Upazilas)",
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
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
