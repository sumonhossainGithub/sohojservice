import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const callbackUrl = searchParams.get("callbackUrl");
  const requestedRole = searchParams.get("role");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("No authorization code provided.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const supaUser = data?.user;
  if (error || !supaUser || !supaUser.email) {
    console.error("Supabase code exchange error:", error);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message || "Failed to verify authentication session.")}`
    );
  }

  const email = supaUser.email.toLowerCase().trim();
  const name =
    (supaUser.user_metadata?.full_name ||
      supaUser.user_metadata?.name ||
      email.split("@")[0] ||
      "User") as string;
  const photoUrl = (supaUser.user_metadata?.avatar_url ||
    supaUser.user_metadata?.picture ||
    null) as string | null;
  const phone = (supaUser.user_metadata?.phone || null) as string | null;

  // Check if user already exists in Drizzle DB
  let dbUser = await db.query.users.findFirst({
    where: or(eq(users.email, email), eq(users.supabaseId, supaUser.id)),
  });

  if (dbUser) {
    // Update existing user with Supabase ID and verified email status
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
    // Determine initial role
    const assignedRole: "CUSTOMER" | "PROFESSIONAL" =
      requestedRole === "PROFESSIONAL" || supaUser.user_metadata?.role === "PROFESSIONAL"
        ? "PROFESSIONAL"
        : "CUSTOMER";

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        phone,
        photoUrl,
        supabaseId: supaUser.id,
        emailVerified: true,
        role: assignedRole,
      })
      .returning();

    dbUser = created;
  }

  // Create unified application session JWT
  const sessionToken = await createSessionToken({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Determine redirect URL
  let targetUrl = "/";
  if (callbackUrl && !callbackUrl.includes("/login") && !callbackUrl.includes("/register")) {
    targetUrl = callbackUrl;
  } else if (dbUser.role === "ADMIN") {
    targetUrl = "/dashboard/admin";
  } else if (dbUser.role === "PROFESSIONAL") {
    targetUrl = "/dashboard/professional";
  } else {
    targetUrl = "/dashboard/customer";
  }

  return NextResponse.redirect(`${origin}${targetUrl}`);
}
