import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { professionalProfiles, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) });

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid location." }, { status: 400 });

  const values = { ...parsed.data, locationUpdatedAt: new Date() };
  await db.update(users).set(values).where(eq(users.id, user.id));
  if (user.role === "PROFESSIONAL") {
    await db.update(professionalProfiles).set(parsed.data).where(eq(professionalProfiles.userId, user.id));
  }
  return NextResponse.json(values);
}
