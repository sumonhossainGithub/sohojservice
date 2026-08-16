import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { validateRealEmail } from "@/lib/email-validator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    const emailCheck = validateRealEmail(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 });
    }

    const cleanEmail = emailCheck.normalizedEmail;

    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please check your spelling or register." },
        { status: 404 }
      );
    }

    // STRICT RULE: Admin passwords cannot be reset via public portal
    if (user.role === "ADMIN") {
      return NextResponse.json(
        {
          error:
            "Admin accounts cannot be reset via the public password reset option for security reasons. Please contact the system administrator.",
        },
        { status: 403 }
      );
    }

    // Generate 6-digit reset OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db
      .update(users)
      .set({
        resetToken: resetCode,
        resetTokenExpiry: expiry,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      resetCode: resetCode, // Displayed on verification screen for instant friction-free resetting
      message: "Reset verification code generated! Enter the code below along with your new password.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
