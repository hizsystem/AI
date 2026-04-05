import { NextRequest, NextResponse } from "next/server";
import { getCalendar, saveCalendar } from "@/lib/storage";
import { getClientConfig } from "@/lib/client-config-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string }> }
) {
  const { client, month } = await params;
  const data = await getCalendar(client, month);
  if (!data) {
    // Return empty calendar structure with config-driven defaults
    const [, mon] = month.split("-");

    // Determine config: for "huenic-veggiet", try "huenic" config
    const configSlug = client.includes("-") ? client.split("-")[0] : client;
    const config = await getClientConfig(configSlug);
    const defaultCategories = config?.defaultCategories ?? [];
    const clientName = config?.name ?? client;

    return NextResponse.json({
      client: clientName,
      clientSlug: client,
      month,
      title: `${mon}월 콘텐츠 캘린더`,
      description: "",
      categories: defaultCategories,
      items: [],
    });
  }
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string }> }
) {
  const { client, month } = await params;
  const body = await req.json();
  await saveCalendar(client, month, body);
  return NextResponse.json({ ok: true });
}
