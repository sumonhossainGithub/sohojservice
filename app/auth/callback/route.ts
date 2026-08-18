import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Google authentication failed: missing authorization code.`);
  }

  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Supabase OAuth code exchange error:", exchangeError);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    const {
      data: { user: sbUser },
    } = await supabase.auth.getUser();

    if (!sbUser || !sbUser.email) {
      return NextResponse.redirect(`${origin}/login?error=Could not retrieve user profile from Google.`);
    }

    const email = sbUser.email.toLowerCase().trim();
    const name =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      email.split("@")[0];
    const photoUrl =
      sbUser.user_metadata?.avatar_url ||
      sbUser.user_metadata?.picture ||
      null;

    // Check if user already exists in Neon database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    let currentUserId = "";
    let currentUserName = name;
    let currentUserEmail = email;
    let currentUserRole: "CUSTOMER" | "PROFESSIONAL" | "ADMIN" = "CUSTOMER";
    let isNewUser = false;

    if (!existingUser) {
      // Create new user in Neon Postgres
      const [inserted] = await db
        .insert(users)
        .values({
          email,
          name,
          photoUrl,
          supabaseId: sbUser.id,
          emailVerified: true,
          role: "CUSTOMER",
        })
        .returning();

      if (!inserted) {
        throw new Error("Failed to insert new user.");
      }

      currentUserId = inserted.id;
      currentUserName = inserted.name;
      currentUserEmail = inserted.email;
      currentUserRole = inserted.role;
      isNewUser = true;
    } else {
      currentUserId = existingUser.id;
      currentUserName = existingUser.name;
      currentUserEmail = existingUser.email;
      currentUserRole = existingUser.role;

      // Update missing Google metadata
      const updates: { photoUrl?: string; supabaseId?: string; emailVerified?: boolean } = {};
      if (!existingUser.photoUrl && photoUrl) updates.photoUrl = photoUrl;
      if (!existingUser.supabaseId) updates.supabaseId = sbUser.id;
      if (!existingUser.emailVerified) updates.emailVerified = true;

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, existingUser.id));
      }
    }

    // Generate SohojService JWT session token
    const token = await createSessionToken({
      id: currentUserId,
      name: currentUserName,
      email: currentUserEmail,
      role: currentUserRole,
    });

    const isHttps = request.url.startsWith("https://");
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    // If new user, redirect to role onboarding
    if (isNewUser) {
      return NextResponse.redirect(`${origin}/onboarding/role?welcome=true`);
    }

    // Existing users redirect based on role or original callback destination
    if (next && next !== "/" && !next.includes("/login") && !next.includes("/register")) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (currentUserRole === "ADMIN") {
      return NextResponse.redirect(`${origin}/dashboard/admin`);
    } else if (currentUserRole === "PROFESSIONAL") {
      return NextResponse.redirect(`${origin}/dashboard/professional`);
    } else {
      return NextResponse.redirect(`${origin}/dashboard/customer`);
    }
  } catch (err: unknown) {
    console.error("Auth callback route exception:", err);
    return NextResponse.redirect(
      `${origin}/login?error=An unexpected error occurred during Google sign-in. Please try again.`
    );
  }
}
