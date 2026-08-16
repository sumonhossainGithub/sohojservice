import { NextResponse } from "next/server";
import { db } from "@/db";
import { instantBookings, professionalProfiles, users, categories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

// POST: Public endpoint - No registration needed
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      categoryName,
      problemDescription,
      area,
      fullAddress,
      urgency = "ASAP",
    } = body;

    if (!customerName?.trim() || !customerPhone?.trim() || !problemDescription?.trim() || !area?.trim()) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Phone, Problem, and Area)." },
        { status: 400 }
      );
    }

    // Basic BD Phone validation: Must be at least 10-11 digits
    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please provide a valid 11-digit mobile number." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(instantBookings)
      .values({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        categoryName: categoryName?.trim() || "General Maintenance",
        problemDescription: problemDescription.trim(),
        area: area.trim(),
        fullAddress: fullAddress?.trim() || area.trim(),
        urgency: urgency || "ASAP",
        status: "NEW",
      })
      .returning();

    return NextResponse.json({
      success: true,
      booking: created,
      message: "Instant booking received! An agent will call you shortly to confirm.",
    });
  } catch (error) {
    console.error("Instant booking creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create instant booking." },
      { status: 500 }
    );
  }
}

// GET: Admin only - List all instant bookings
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const allInstantBookings = await db.query.instantBookings.findMany({
      orderBy: [desc(instantBookings.createdAt)],
      with: {
        assignedProfessional: {
          with: {
            user: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ instantBookings: allInstantBookings });
  } catch (error) {
    console.error("Fetch instant bookings error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch instant bookings." },
      { status: 500 }
    );
  }
}
