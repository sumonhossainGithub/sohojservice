import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users, professionalProfiles } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Check bearer token header first if client passes access_token
    const authHeader = req.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7).trim()
      : null;

    let supaUser = null;

    if (bearerToken) {
      const { data, error } = await supabase.auth.getUser(bearerToken);
      if (!error && data?.user) {
        supaUser = data.user;
      }
    }

    if (!supaUser) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        supaUser = data.user;
      }
    }

    if (!supaUser || !supaUser.email) {
      return NextResponse.json({ error: "Unauthorized session." }, { status: 401 });
    }

    const email = supaUser.email.toLowerCase().trim();
    const name = (supaUser.user_metadata?.full_name ||
      supaUser.user_metadata?.name ||
      email.split("@")[0] ||
      "User") as string;
    const photoUrl = (supaUser.user_metadata?.avatar_url ||
      supaUser.user_metadata?.picture ||
      null) as string | null;
    const phone = (supaUser.user_metadata?.phone || null) as string | null;

    let dbUser = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.supabaseId, supaUser.id)),
    });

    let isNewPro = false;

    if (dbUser) {
      const [updated] = await db
        .update(users)
        .set({
          supabaseId: supaUser.id,
          emailVerified: true,
          photoUrl: dbUser.photoUrl || photoUrl,
          name: dbUser.name || name,
          phone: dbUser.phone || phone,
        })
        .where(eq(users.id, dbUser.id))
        .returning();
      dbUser = updated;

      if (dbUser.role === "PROFESSIONAL") {
        const proProfile = await db.query.professionalProfiles.findFirst({
          where: eq(professionalProfiles.userId, dbUser.id),
        });
        if (!proProfile) {
          isNewPro = true;
        }
      }
    } else {
      const role = (supaUser.user_metadata?.role as "CUSTOMER" | "PROFESSIONAL") || "CUSTOMER";
      const [created] = await db
        .insert(users)
        .values({
          name,
          email,
          phone,
          photoUrl,
          supabaseId: supaUser.id,
          emailVerified: true,
          role,
        })
        .returning();
      dbUser = created;

      if (role === "PROFESSIONAL") {
        isNewPro = true;
      }
    }

    const token = await createSessionToken({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    });

    const response = NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
      isNewPro,
    });

    const isHttps = req.url.startsWith("https://");
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (err) {
    console.error("Auth sync error:", err);
    return NextResponse.json({ error: "Failed to sync session." }, { status: 500 });
  }
}
