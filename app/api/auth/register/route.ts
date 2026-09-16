import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await db.user.create({
      data: {
        email: validated.email.toLowerCase(),
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        role: "USER",
        status: "ACTIVE",
      },
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };

    // ในไฟล์ register/route.ts
    const token = await createSessionToken(tokenPayload);
    await setSessionCookie(token); // 📌 ใส่ await หน้า setSessionCookie

    return NextResponse.json(
      { success: true, data: tokenPayload },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message:
          error.errors?.[0]?.message || error.message || "Registration failed",
      },
      { status: 400 },
    );
  }
}
