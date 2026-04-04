import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const COOKIE_NAME = "cc-admin-auth";
const TOKEN_VALUE = "authenticated";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, TOKEN_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
