import { getSession } from "./auth";
import { NextResponse } from "next/server";
import { UserSession } from "@/types";

interface AuthResult {
  error: NextResponse | null;
  session: UserSession | null;
}

/**
 * 1. ตรวจสอบการเข้าสู่ระบบ และสถานะของ Account
 * ใช้สำหรับ API Routes ที่ต้องการให้เข้าถึงได้เฉพาะผู้ที่ Login แล้วเท่านั้น
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession();

  // หากยังไม่ได้เข้าสู่ระบบ -> ส่ง 401 Unauthorized
  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized: Please log in to proceed" },
        { status: 401 },
      ),
      session: null,
    };
  }

  // หากบัญชีถูก Deactivate โดย Admin -> ส่ง 403 Forbidden
  if (session.status !== "ACTIVE") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Forbidden: Your account has been deactivated",
        },
        { status: 403 },
      ),
      session: null,
    };
  }

  return { error: null, session };
}

/**
 * 2. ตรวจสอบสิทธิ์ระดับ ADMIN
 * ใช้สำหรับป้องกัน Admin Routes (/api/admin/*) ไม่ให้ USER ทั่วไปเข้าถึงได้
 */
export async function requireAdmin(): Promise<AuthResult> {
  const auth = await requireAuth();

  // หากติด error จากการเช็ค Auth ขั้นแรก -> ส่ง error กลับทันที
  if (auth.error) return auth;

  // หากสิทธิ์ไม่ใช่ ADMIN -> ส่ง 403 Forbidden
  if (auth.session?.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { success: false, message: "Forbidden: Admin privileges required" },
        { status: 403 },
      ),
      session: null,
    };
  }

  return auth;
}
