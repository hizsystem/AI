import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCalendar, saveCalendar } from "@/lib/storage";
import type { CalendarData } from "@/data/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("cc-admin-auth")?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientKey, month, title, categories } = await req.json();

  if (!clientKey || !month) {
    return NextResponse.json({ error: "clientKey and month required" }, { status: 400 });
  }

  // Check if already exists
  const existing = await getCalendar(clientKey, month);
  if (existing) {
    return NextResponse.json({ error: "Calendar already exists", existing: true }, { status: 409 });
  }

  const data: CalendarData = {
    client: clientKey,
    clientSlug: clientKey,
    month,
    title: title || `${month} Content Calendar`,
    description: "",
    categories: categories || [],
    items: [],
  };

  await saveCalendar(clientKey, month, data);
  return NextResponse.json({ success: true, data });
}
