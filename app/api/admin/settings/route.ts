import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const DEFAULT_SETTINGS: Record<string, string> = {
  emergency_hotline: "01700-000000",
  support_whatsapp: "8801700000000",
  support_email: "support@sohojservice.com",
  banner_announcement_text: "⚡ 24/7 Monsoon Emergency Electrician & Plumbing Support active in Sirajganj",
  banner_announcement_active: "true",
  banner_announcement_type: "emergency", // "emergency" | "info" | "warning" | "success"
  default_visiting_fee: "300",
  maintenance_mode: "false",
};

export async function GET() {
  try {
    const all = await db.select().from(platformSettings);
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };

    for (const item of all) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json(settingsMap);
  } catch (err: unknown) {
    console.error("Fetch settings error:", err);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
    }

    for (const [key, value] of Object.entries(body)) {
      if (typeof key === "string" && typeof value === "string") {
        const existing = await db.query.platformSettings.findFirst({
          where: eq(platformSettings.key, key),
        });

        if (existing) {
          await db
            .update(platformSettings)
            .set({ value, updatedAt: new Date() })
            .where(eq(platformSettings.key, key));
        } else {
          await db.insert(platformSettings).values({
            id: createId(),
            key,
            value,
          });
        }
      }
    }

    // Return updated settings
    const updated = await db.select().from(platformSettings);
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const item of updated) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json({
      message: "Platform settings updated successfully.",
      settings: settingsMap,
    });
  } catch (err: unknown) {
    console.error("Save settings error:", err);
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
