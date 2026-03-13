import { NextRequest, NextResponse } from "next/server";
import { getCalendar, saveCalendar } from "@/lib/storage";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string }> }
) {
  const { client, month } = await params;
  const data = await getCalendar(client, month);
  if (!data) {
    return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
  }

  const item = await req.json();
  if (!item.id) {
    item.id = `content-${Date.now()}`;
  }

  data.items.push(item);
  await saveCalendar(client, month, data);

  return NextResponse.json(item, { status: 201 });
}
