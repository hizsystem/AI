import { NextRequest, NextResponse } from "next/server";
import { mutateCalendar } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string; id: string }> }
) {
  const { client, month, id } = await params;

  try {
    const updates = await req.json();
    let updated: unknown = null;
    let itemMissing = false;

    const result = await mutateCalendar(
      client,
      month,
      (data) => {
        const idx = data.items.findIndex((item) => item.id === id);
        if (idx === -1) {
          itemMissing = true;
          return;
        }
        const oldItem = data.items[idx];
        data.items[idx] = { ...oldItem, ...updates };
        if (updates.overview) {
          // Merge old + new, then strip null (= explicitly cleared by client)
          const merged = { ...oldItem.overview, ...updates.overview } as Record<string, unknown>;
          for (const key of Object.keys(merged)) {
            if (merged[key] === null) delete merged[key];
          }
          data.items[idx].overview = merged as typeof oldItem.overview;
        }
        updated = data.items[idx];
      }
    );

    if (!result) {
      return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
    }
    if (itemMissing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /items error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string; id: string }> }
) {
  const { client, month, id } = await params;

  try {
    let itemMissing = false;
    const result = await mutateCalendar(client, month, (data) => {
      const idx = data.items.findIndex((item) => item.id === id);
      if (idx === -1) {
        itemMissing = true;
        return;
      }
      data.items.splice(idx, 1);
    });

    if (!result) {
      return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
    }
    if (itemMissing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /items error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
