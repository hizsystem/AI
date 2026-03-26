import { NextRequest, NextResponse } from "next/server";
import { getCalendar, saveCalendar } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string; id: string }> }
) {
  const { client, month, id } = await params;
  const data = await getCalendar(client, month);
  if (!data) {
    return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
  }

  const updates = await req.json();
  const idx = data.items.findIndex((item) => item.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const oldItem = data.items[idx];
  data.items[idx] = { ...oldItem, ...updates };
  if (updates.overview) {
    data.items[idx].overview = { ...oldItem.overview, ...updates.overview };
  }

  await saveCalendar(client, month, data);
  return NextResponse.json(data.items[idx]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string; id: string }> }
) {
  const { client, month, id } = await params;
  const data = await getCalendar(client, month);
  if (!data) {
    return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
  }

  const idx = data.items.findIndex((item) => item.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  data.items.splice(idx, 1);
  await saveCalendar(client, month, data);
  return NextResponse.json({ ok: true });
}
