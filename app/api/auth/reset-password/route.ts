import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password required" },
        { status: 400 },
      );
    }

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      db.auditLog.create({
        data: {
          userId: resetToken.userId,
          action: "RESET_PASSWORD",
          entity: "User",
          entityId: resetToken.userId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Failed to reset password" },
      { status: 500 },
    );
  }
}
