import { NextRequest, NextResponse } from "next/server";
import { getCalendar, saveCalendar, buildDefaultCalendar } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string }> }
) {
  const { client, month } = await params;
  const data = await getCalendar(client, month);
  if (!data) {
    return NextResponse.json(await buildDefaultCalendar(client, month));
  }
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string }> }
) {
  const { client, month } = await params;
  try {
    const body = await req.json();
    await saveCalendar(client, month, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /calendar error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
