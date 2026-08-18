import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
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
  const errorParam = searchParams.get("error_description") || searchParams.get("error");

  // Determine actual public origin (handles Vercel reverse proxy / load balancers)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const baseOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : origin;
  const isSecure = baseOrigin.startsWith("https://");

  if (errorParam) {
    console.error("OAuth provider error:", errorParam);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorParam)}`, baseOrigin)
    );
  }

  if (!code) {
    console.error("OAuth callback: No authorization code present in request URL.");
    return NextResponse.redirect(
      new URL("/login?error=Authentication+failed.+No+code+received.", baseOrigin)
    );
  }

  try {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    const supaUser = data?.user;
    if (exchangeError || !supaUser || !supaUser.email) {
      console.error("Supabase code exchange failed:", exchangeError);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(
            exchangeError?.message || "Failed to verify Google account."
          )}`,
          baseOrigin
        )
      );
    }

    const email = (supaUser.email as string).toLowerCase().trim();
    const metadata = supaUser.user_metadata || {};
    const name =
      ((metadata.full_name || metadata.name || email.split("@")[0] || "User") as string) || "User";
    const photoUrl = (metadata.avatar_url || metadata.picture || null) as string | null;
    const phone = (metadata.phone || null) as string | null;

    // Check if user already exists in Drizzle DB
    let dbUser = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.supabaseId, supaUser.id)),
    });

    let isNewPro = false;

    if (dbUser) {
      // Update existing user record
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
        const existingProfile = await db.query.professionalProfiles.findFirst({
          where: eq(professionalProfiles.userId, dbUser.id),
        });
        if (!existingProfile) {
          isNewPro = true;
        }
      }
    } else {
      // Create new user
      const assignedRole: "CUSTOMER" | "PROFESSIONAL" =
        requestedRole === "PROFESSIONAL" || metadata.role === "PROFESSIONAL"
          ? "PROFESSIONAL"
          : "CUSTOMER";

      const [created] = await db
        .insert(users)
        .values({
          id: createId(),
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

    // Create Sohoj application session token
    const sessionToken = await createSessionToken({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    });

    // Destination determination
    let redirectPath = "/";
    if (isNewPro) {
      redirectPath = "/dashboard/professional?welcome=true";
    } else if (callbackUrl && !callbackUrl.includes("/login") && !callbackUrl.includes("/register")) {
      redirectPath = callbackUrl;
    }

    const redirectUrl = new URL(redirectPath, baseOrigin);
    const response = NextResponse.redirect(redirectUrl);

    // Set Sohoj application session cookie
    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // Forward Supabase auth session cookies
    const cookieStore = await cookies();
    cookieStore.getAll().forEach((c) => {
      response.cookies.set(c.name, c.value, {
        path: "/",
        sameSite: "lax",
        secure: isSecure,
      });
    });

    return response;
  } catch (err: unknown) {
    console.error("Fatal callback processing error:", err);
    return NextResponse.redirect(
      new URL("/login?error=Server+error+during+sign+in.+Please+try+again.", baseOrigin)
    );
  }
}
