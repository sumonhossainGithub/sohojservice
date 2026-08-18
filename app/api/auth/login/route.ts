import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

const schema = z.object({
  identifier: z.string().min(1, "Please enter your email or mobile number."),
  password: z.string().min(1, "Please enter your password."),
});

// Helper to normalize phone numbers (e.g. +8801712345678, 8801712345678 -> 01712345678)
function normalizePhone(val: string): string[] {
  const digits = val.replace(/\D/g, "");
  const variations = new Set<string>();
  variations.add(val.trim());
  if (digits) {
    variations.add(digits);
    if (digits.startsWith("880") && digits.length === 13) {
      variations.add("0" + digits.substring(3));
    }
    if (digits.length === 11 && digits.startsWith("01")) {
      variations.add("+88" + digits);
      variations.add("88" + digits);
    }
  }
  return Array.from(variations);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please enter your email/phone and password." },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;
    const trimmed = identifier.trim();
    const isEmail = trimmed.includes("@");

    let user;

    if (isEmail) {
      const cleanEmail = trimmed.toLowerCase();
      user = await db.query.users.findFirst({
        where: eq(users.email, cleanEmail),
      });
    } else {
      // Phone number lookup with all common format variations
      const phoneVariations = normalizePhone(trimmed);
      const conditions = phoneVariations.map((p) => eq(users.phone, p));

      user = await db.query.users.findFirst({
        where: or(...conditions),
      });
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/mobile number and password." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your password." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const isHttps = req.url.startsWith("https://");
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in. Please try again." },
      { status: 500 }
    );
  }
}
