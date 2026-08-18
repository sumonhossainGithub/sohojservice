import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, professionalProfiles, categories } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const [allCategories, existingProfile, userRecord] = await Promise.all([
      db.query.categories.findMany(),
      db.query.professionalProfiles.findFirst({
        where: eq(professionalProfiles.userId, user.id),
        with: {
          category: true,
        },
      }),
      db.query.users.findFirst({
        where: eq(users.id, user.id),
      }),
    ]);

    return NextResponse.json({
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: userRecord?.phone || null,
        photoUrl: userRecord?.photoUrl || null,
      },
      professionalProfile: existingProfile || null,
      categories: allCategories,
    });
  } catch (err: unknown) {
    console.error("GET set-role error:", err);
    return NextResponse.json({ error: "Failed to fetch profile role data." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { role, professionalData } = body;

    if (role !== "CUSTOMER" && role !== "PROFESSIONAL") {
      return NextResponse.json(
        { error: "Invalid role selected. Must be CUSTOMER or PROFESSIONAL." },
        { status: 400 }
      );
    }

    // Update user role and phone in users table
    const userUpdatePayload: Record<string, any> = { role };
    if (professionalData?.phone) {
      userUpdatePayload.phone = professionalData.phone;
    }
    await db.update(users).set(userUpdatePayload).where(eq(users.id, user.id));

    // If role is PROFESSIONAL, create or update professional profile
    if (role === "PROFESSIONAL") {
      let categoryId = professionalData?.categoryId;

      // If categorySlug passed instead of categoryId, look it up
      if (!categoryId && professionalData?.categorySlug) {
        const matchedCat = await db.query.categories.findFirst({
          where: eq(categories.slug, professionalData.categorySlug),
        });
        if (matchedCat) categoryId = matchedCat.id;
      }

      if (!categoryId) {
        const firstCat = await db.query.categories.findFirst();
        if (firstCat) categoryId = firstCat.id;
      }

      if (categoryId) {
        const existingProfile = await db.query.professionalProfiles.findFirst({
          where: eq(professionalProfiles.userId, user.id),
        });

        if (!existingProfile) {
          await db.insert(professionalProfiles).values({
            userId: user.id,
            categoryId: categoryId,
            area: professionalData?.area || "Sirajganj Sadar",
            city: professionalData?.city || "Sirajganj",
            yearsExperience: professionalData?.yearsExperience || 2,
            ratePerVisit: professionalData?.ratePerVisit || 300,
            bio: professionalData?.bio || "",
            latitude: professionalData?.latitude || null,
            longitude: professionalData?.longitude || null,
            isVerified: false,
            isAvailable: true,
          });
        } else {
          await db
            .update(professionalProfiles)
            .set({
              categoryId: categoryId,
              area: professionalData?.area || existingProfile.area,
              city: professionalData?.city || existingProfile.city,
              yearsExperience: professionalData?.yearsExperience ?? existingProfile.yearsExperience,
              ratePerVisit: professionalData?.ratePerVisit ?? existingProfile.ratePerVisit,
              bio: professionalData?.bio ?? existingProfile.bio,
              latitude: professionalData?.latitude ?? existingProfile.latitude,
              longitude: professionalData?.longitude ?? existingProfile.longitude,
            })
            .where(eq(professionalProfiles.id, existingProfile.id));
        }
      }
    }

    // Re-issue updated session token cookie with the newly selected role
    const updatedToken = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
    });

    const isHttps = req.url.startsWith("https://");
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, updatedToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({
      success: true,
      role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (err: unknown) {
    console.error("set-role route error:", err);
    return NextResponse.json(
      { error: "Failed to update account role. Please try again." },
      { status: 500 }
    );
  }
}
