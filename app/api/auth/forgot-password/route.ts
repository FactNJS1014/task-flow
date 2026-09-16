import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMail, generateEmailTemplate } from "@/lib/mail";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If account exists, reset link has been sent.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // Token อายุ 1 ชั่วโมง

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    const content = `
      <p>Hello ${user.firstName},</p>
      <p>You requested to reset your password for TaskFlow.</p>
      <p>Please click the button below to set a new password. This link is valid for 1 hour.</p>
    `;

    sendMail({
      to: user.email,
      subject: "[TaskFlow] Password Reset Request",
      html: generateEmailTemplate("Password Reset", content, resetUrl),
    });

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 },
    );
  }
}
