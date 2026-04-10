import { NextRequest, NextResponse } from "next/server";

const SLACK_WEBHOOK_URL = process.env.SLACK_TASK_WEBHOOK_URL;

function isAdmin(req: NextRequest): boolean {
  if (req.cookies.get("cc-admin-auth")?.value === "authenticated") return true;
  const auth = req.headers.get("authorization");
  if (auth && process.env.ADMIN_PASSWORD) {
    return auth.replace(/^Bearer\s+/i, "") === process.env.ADMIN_PASSWORD;
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!SLACK_WEBHOOK_URL) {
    return NextResponse.json({ error: "Slack webhook not configured" }, { status: 503 });
  }

  const { text } = await req.json();

  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Slack send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
