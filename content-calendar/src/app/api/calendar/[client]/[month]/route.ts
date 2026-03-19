import { NextRequest, NextResponse } from "next/server";
import { getCalendar, saveCalendar } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ client: string; month: string }> }
) {
  const { client, month } = await params;
  const data = await getCalendar(client, month);
  if (!data) {
    // Return empty calendar structure instead of 404
    const clientName = client.replace("huenic-", "").toUpperCase();
    const [year, mon] = month.split("-");
    return NextResponse.json({
      client: clientName,
      clientSlug: client,
      month,
      title: `${clientName} ${mon}월 콘텐츠 캘린더`,
      description: "",
      categories: [
        { id: "recipe", name: "레시피/제품", color: "#10b981" },
        { id: "branding", name: "브랜딩", color: "#3b82f6" },
        { id: "reels", name: "릴스", color: "#f97316" },
        { id: "seeding", name: "시딩/콜라보", color: "#8b5cf6" },
      ],
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
