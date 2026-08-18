import { NextResponse } from "next/server";
import { db } from "@/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const [allInstant, allBookings, allUsers, allPros, allReviews, allCategories] = await Promise.all([
      db.query.instantBookings.findMany(),
      db.query.bookings.findMany(),
      db.query.users.findMany(),
      db.query.professionalProfiles.findMany(),
      db.query.reviews.findMany(),
      db.query.categories.findMany(),
    ]);

    const totalInstant = allInstant.length;
    const completedInstant = allInstant.filter((b) => b.status === "COMPLETED").length;
    const activeInstant = allInstant.filter((b) => b.status === "NEW" || b.status === "ASSIGNED" || b.status === "CONTACTED").length;

    const totalDirect = allBookings.length;
    const completedDirect = allBookings.filter((b) => b.status === "COMPLETED").length;

    const totalDone = completedInstant + completedDirect;
    const totalJobs = totalInstant + totalDirect;
    const fulfillmentRate = totalJobs > 0 ? Math.round((totalDone / totalJobs) * 100) : 100;

    // Estimate Gross Merchandise Value (GMV in ৳ BDT)
    // Avg visiting rate 350 BDT
    const avgRate = 350;
    const estimatedGmv = totalDone * avgRate;

    // Category distribution from instant bookings
    const categoryCounts: Record<string, number> = {};
    for (const item of allInstant) {
      const cat = item.categoryName || "Other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Area distribution
    const areaCounts: Record<string, number> = {};
    for (const item of allInstant) {
      const area = item.area || "Sirajganj";
      areaCounts[area] = (areaCounts[area] || 0) + 1;
    }
    const topAreas = Object.entries(areaCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // User breakdown
    const customerCount = allUsers.filter((u) => u.role === "CUSTOMER").length;
    const proUserCount = allUsers.filter((u) => u.role === "PROFESSIONAL").length;
    const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;

    const verifiedPros = allPros.filter((p) => p.isVerified).length;
    const pendingPros = allPros.filter((p) => !p.isVerified).length;

    const avgPlatformRating =
      allReviews.length > 0
        ? Math.round((allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length) * 10) / 10
        : 4.9;

    return NextResponse.json({
      financials: {
        estimatedGmv,
        avgTicket: avgRate,
        completedVolume: totalDone,
      },
      operations: {
        totalJobs,
        totalDone,
        activeInstant,
        fulfillmentRate,
        instantBookingsCount: totalInstant,
        directBookingsCount: totalDirect,
      },
      people: {
        totalUsers: allUsers.length,
        customerCount,
        proUserCount,
        adminCount,
        verifiedPros,
        pendingPros,
        totalCategories: allCategories.length,
        totalReviews: allReviews.length,
        avgPlatformRating,
      },
      topCategories,
      topAreas,
    });
  } catch (err: unknown) {
    console.error("Fetch analytics error:", err);
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 });
  }
}
