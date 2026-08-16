import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user: supaUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supaUser || !supaUser.email) {
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
    }

    const token = await createSessionToken({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
      },
    });
  } catch (err) {
    console.error("Auth sync error:", err);
    return NextResponse.json({ error: "Failed to sync session." }, { status: 500 });
  }
}
