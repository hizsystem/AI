import { NextRequest, NextResponse } from "next/server";
import { mutateCalendar } from "@/lib/storage";
import type { ContentItem } from "@/data/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string }> }
) {
  const { client, month } = await params;

  try {
    const item = (await req.json()) as ContentItem;
    if (!item.id) {
      item.id = `content-${Date.now()}`;
    }

    await mutateCalendar(
      client,
      month,
      (data) => {
        data.items.push(item);
      },
      { createIfMissing: true }
    );

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("POST /items error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
