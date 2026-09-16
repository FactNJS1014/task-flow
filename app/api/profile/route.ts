import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

// 📌 1. GET Method สำหรับดึงข้อมูล Profile
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// 📌 2. PATCH Method สำหรับอัปเดตข้อมูล Profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validated = profileSchema.parse(body);

    const updatedUser = await db.user.update({
      where: { id: session.id },
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    // บันทึก Audit Log
    await db.auditLog.create({
      data: {
        userId: session.id,
        action: "UPDATE_PROFILE",
        entity: "User",
        entityId: session.id,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: any) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.errors?.[0]?.message ||
          error.message ||
          "Failed to update profile",
      },
      { status: 400 },
    );
  }
}
