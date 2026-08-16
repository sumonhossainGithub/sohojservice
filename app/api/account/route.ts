import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { professionalProfiles, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const photoSchema = z.object({
  photoUrl: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/, "Please upload a JPG, PNG, or WebP image.")
    .max(750_000, "Please choose an image smaller than 500 KB."),
});

export async function GET() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const [account] = await db
    .select({ name: users.name, email: users.email, phone: users.phone, photoUrl: users.photoUrl, role: users.role, latitude: users.latitude, longitude: users.longitude })
    .from(users)
    .where(eq(users.id, sessionUser.id));

  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  return NextResponse.json({ user: account });
}

export async function PATCH(req: Request) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const parsed = photoSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid image." }, { status: 400 });
  }

  await db.update(users).set({ photoUrl: parsed.data.photoUrl }).where(eq(users.id, sessionUser.id));
  if (sessionUser.role === "PROFESSIONAL") {
    await db
      .update(professionalProfiles)
      .set({ photoUrl: parsed.data.photoUrl })
      .where(eq(professionalProfiles.userId, sessionUser.id));
  }

  return NextResponse.json({ photoUrl: parsed.data.photoUrl });
}
