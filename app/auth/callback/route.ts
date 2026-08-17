import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, professionalProfiles } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const callbackUrl = searchParams.get("callbackUrl");
  const requestedRole = searchParams.get("role");
  const isHttps = request.url.startsWith("https://");

  // If no server auth code, forward to client-side session sync handler (handles hash tokens)
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/sync-session?${searchParams.toString()}`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    const supaUser = data?.user;

    if (error || !supaUser || !supaUser.email) {
      console.error("Supabase code exchange error:", error);
      // Forward to client sync fallback with code so browser client can try
      return NextResponse.redirect(`${origin}/auth/sync-session?${searchParams.toString()}`);
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

    let isNewPro = false;

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

      // Check if this professional needs to complete their initial profile
      if (dbUser.role === "PROFESSIONAL") {
        const existingProfile = await db.query.professionalProfiles.findFirst({
          where: eq(professionalProfiles.userId, dbUser.id),
        });
        if (!existingProfile) {
          isNewPro = true;
        }
      }
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

      if (assignedRole === "PROFESSIONAL") {
        isNewPro = true;
      }
    }

    // Create unified application session JWT
    const sessionToken = await createSessionToken({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    });

    const destination = isNewPro
      ? `${origin}/dashboard/professional?welcome=true`
      : callbackUrl && !callbackUrl.includes("/login") && !callbackUrl.includes("/register")
      ? `${origin}${callbackUrl}`
      : `${origin}/`;

    // Explicitly attach Set-Cookie on the redirect response object
    const response = NextResponse.redirect(destination);
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // Also forward any Supabase session cookies
    const cookieStore = await cookies();
    cookieStore.getAll().forEach((c) => {
      response.cookies.set(c.name, c.value, {
        path: "/",
        sameSite: "lax",
        secure: isHttps,
      });
    });

    return response;
  } catch (err) {
    console.error("Callback route error:", err);
    return NextResponse.redirect(`${origin}/auth/sync-session?${searchParams.toString()}`);
  }
}
