import { NextResponse } from "next/server";
import { db } from "@/db";
import { instantBookings } from "@/db/schema";
import { desc, eq, or, ilike } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query =
      searchParams.get("query")?.trim() ||
      searchParams.get("id")?.trim() ||
      searchParams.get("phone")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Please enter a Tracking ID or Mobile Number." },
        { status: 400 }
      );
    }

    const cleanDigits = query.replace(/\D/g, "");
    const cleanId = query.replace(/^#/, "").trim().toLowerCase();

    // Query by full ID, ID suffix/contains, or phone number
    const results = await db.query.instantBookings.findMany({
      where: or(
        eq(instantBookings.id, cleanId),
        ilike(instantBookings.id, `%${cleanId}%`),
        cleanDigits.length >= 6
          ? ilike(instantBookings.customerPhone, `%${cleanDigits}%`)
          : undefined
      ),
      orderBy: [desc(instantBookings.createdAt)],
      limit: 5,
      with: {
        assignedProfessional: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                phone: true,
                photoUrl: true,
              },
            },
            category: true,
          },
        },
      },
    });

    if (!results.length) {
      return NextResponse.json(
        { error: "No instant booking found matching this ID or Phone Number." },
        { status: 404 }
      );
    }

    return NextResponse.json({ bookings: results });
  } catch (error) {
    console.error("Track booking error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve booking tracking details." },
      { status: 500 }
    );
  }
}
