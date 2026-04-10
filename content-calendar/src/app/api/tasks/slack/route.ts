import { NextRequest, NextResponse } from "next/server";

const SLACK_WEBHOOK_URL = process.env.SLACK_TASK_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  if (req.cookies.get("cc-admin-auth")?.value !== "authenticated") {
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
