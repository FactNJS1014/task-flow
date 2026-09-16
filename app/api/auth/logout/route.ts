import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // 📌 เรียกใช้ await getSession() ใน Next.js 16
    const session = await getSession();

    if (session) {
      // บันทึก Audit Log การ Logout
      await db.auditLog.create({
        data: {
          userId: session.id,
          action: "LOGOUT",
          entity: "User",
          entityId: session.id,
        },
      });
    }

    // 📌 ลบ Session Cookie ด้วย await
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("POST /api/auth/logout error:", error);

    // หากเกิด Error ให้พยายามลบ Cookie เพื่อความปลอดภัยของผู้ใช้
    await clearSessionCookie();

    return NextResponse.json(
      { success: false, message: error.message || "Logout failed" },
      { status: 500 },
    );
  }
}
