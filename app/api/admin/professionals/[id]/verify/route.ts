import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { professionalProfiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({ isVerified: z.boolean() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const [updated] = await db
    .update(professionalProfiles)
    .set({ isVerified: parsed.data.isVerified })
    .where(eq(professionalProfiles.id, id))
    .returning();

  return NextResponse.json(updated);
}
