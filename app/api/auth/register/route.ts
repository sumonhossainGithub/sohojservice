import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq, or } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db";
import { users, professionalProfiles } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { validateRealEmail } from "@/lib/email-validator";

const schema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters."),
  email: z.string().min(3, "Please provide a valid email address."),
  phone: z.string().min(10, "Please enter a valid mobile number (e.g. 017XXXXXXXX)."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["CUSTOMER", "PROFESSIONAL"]).default("CUSTOMER"),
  // Optional professional setup fields
  categoryId: z.string().optional(),
  area: z.string().optional(),
  yearsExperience: z.number().optional(),
  ratePerVisit: z.number().optional(),
  bio: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please verify your input fields." },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      role,
      categoryId,
      area,
      yearsExperience,
      ratePerVisit,
      bio,
    } = parsed.data;

    // 1. Strict real email format and throwaway domain check
    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }
    const cleanEmail = emailCheck.normalizedEmail;
    const cleanPhone = phone.trim();

    // 2. Check if email or phone already registered
    const existing = await db.query.users.findFirst({
      where: or(eq(users.email, cleanEmail), eq(users.phone, cleanPhone)),
    });

    if (existing) {
      if (existing.email.toLowerCase() === cleanEmail) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please log in instead." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "An account with this mobile number already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = createId();

    // 4. Create user in database
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role,
        emailVerified: true,
      })
      .returning();

    // 5. If registering as a professional and category is supplied, create professional profile
    if (role === "PROFESSIONAL" && categoryId) {
      try {
        await db.insert(professionalProfiles).values({
          id: createId(),
          userId: user.id,
          categoryId,
          area: area?.trim() || "Sirajganj Sadar",
          city: "Sirajganj",
          yearsExperience: yearsExperience ?? 1,
          ratePerVisit: ratePerVisit ?? 300,
          bio: bio?.trim() || `Professional service provider in ${area || "Sirajganj"}.`,
          isAvailable: true,
          isVerified: false,
        });
      } catch (proErr) {
        console.warn("Professional profile creation notice:", proErr);
      }
    }

    // 6. Generate authenticated application session token
    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 7. Set HTTP-only session cookie
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
    console.error("Register route error:", err);
    return NextResponse.json(
      { error: "Registration could not be completed. Please try again." },
      { status: 500 }
    );
  }
}
