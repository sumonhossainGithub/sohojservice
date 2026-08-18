import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const allReviews = await db.query.reviews.findMany({
      orderBy: [desc(reviews.createdAt)],
      with: {
        author: {
          columns: { id: true, name: true, email: true, phone: true, photoUrl: true },
        },
        professional: {
          with: {
            user: {
              columns: { id: true, name: true, email: true, phone: true, photoUrl: true },
            },
            category: {
              columns: { id: true, nameEn: true, nameBn: true, slug: true },
            },
          },
        },
      },
    });

    const formatted = allReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      author: r.author
        ? {
            id: r.author.id,
            name: r.author.name,
            email: r.author.email,
            phone: r.author.phone,
            photoUrl: r.author.photoUrl,
          }
        : { id: "unknown", name: "Anonymous Customer", email: "", phone: "", photoUrl: null },
      professional: r.professional
        ? {
            id: r.professional.id,
            name: r.professional.user?.name || "Service Professional",
            categoryName: r.professional.category?.nameEn || "General Service",
            area: r.professional.area,
            city: r.professional.city,
            photoUrl: r.professional.user?.photoUrl || r.professional.photoUrl,
          }
        : { id: "unknown", name: "Unknown Pro", categoryName: "General", area: "", city: "", photoUrl: null },
    }));

    const stats = {
      total: formatted.length,
      avgRating:
        formatted.length > 0
          ? Math.round((formatted.reduce((acc, r) => acc + r.rating, 0) / formatted.length) * 10) / 10
          : 0,
      rating5: formatted.filter((r) => r.rating === 5).length,
      rating4: formatted.filter((r) => r.rating === 4).length,
      rating3: formatted.filter((r) => r.rating === 3).length,
      rating2: formatted.filter((r) => r.rating === 2).length,
      rating1: formatted.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      reviews: formatted,
      stats,
    });
  } catch (err: unknown) {
    console.error("Fetch admin reviews error:", err);
    return NextResponse.json({ error: "Failed to load reviews." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing review ID." }, { status: 400 });
    }

    await db.delete(reviews).where(eq(reviews.id, id));

    return NextResponse.json({ message: "Review deleted successfully." });
  } catch (err: unknown) {
    console.error("Delete review error:", err);
    return NextResponse.json({ error: "Failed to delete review." }, { status: 500 });
  }
}
