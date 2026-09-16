import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { UserSession } from "@/types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-at-least-32-characters-long",
);

const TOKEN_NAME = "taskflow_session";

export async function createSessionToken(
  payload: UserSession,
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string,
): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch (err) {
    return null;
  }
}

// 📌 แก้ไขจุดนี้: ใส่ await หน้า cookies()
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

// 📌 แก้ไขจุดนี้: เปลี่ยนเป็น async function และใส่ await หน้า cookies()
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// 📌 แก้ไขจุดนี้: เปลี่ยนเป็น async function และใส่ await หน้า cookies()
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
