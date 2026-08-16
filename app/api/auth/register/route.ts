import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { validateRealEmail } from "@/lib/email-validator";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().min(3),
  phone: z.string().min(6).optional(),
  photoUrl: z.string().url().or(z.literal("")).optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["CUSTOMER", "PROFESSIONAL"]).default("CUSTOMER"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Please check your details and try again." },
      { status: 400 }
    );
  }

  const { name, email, phone, password, role, photoUrl } = parsed.data;

  // Strict Real Email Check
  const emailCheck = validateRealEmail(email);
  if (!emailCheck.valid) {
    return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }
  const cleanEmail = emailCheck.normalizedEmail;

  const existing = await db.query.users.findFirst({ where: eq(users.email, cleanEmail) });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ name, email, phone, photoUrl: photoUrl || null, passwordHash, role })
    .returning();

  const token = await createSessionToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
