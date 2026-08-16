import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // STRICT RULE: Except Admin
    if (sessionUser.role === "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Admin password modification is disabled via the public account portal for security reasons. Please contact system administrator.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid password details." },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const userInDb = await db.query.users.findFirst({
      where: eq(users.id, sessionUser.id),
    });

    if (!userInDb) {
      return NextResponse.json({ error: "User record not found." }, { status: 404 });
    }

    // Verify current password if user has an existing password
    if (userInDb.passwordHash) {
      const isCurrentValid = await bcrypt.compare(currentPassword, userInDb.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "The current password you entered is incorrect." },
          { status: 400 }
        );
      }
    }

    // Hash new password and update
    const newHash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, sessionUser.id));

    return NextResponse.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    console.error("Account password change error:", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
