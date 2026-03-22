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
    const [, mon] = month.split("-");

    // Client-specific default categories
    const defaultCategories = client === "tabshopbar"
      ? [
          { id: "place", name: "#탭샵바플레이스", color: "#4A7BF7", description: "지점·공간 소개" },
          { id: "pairing", name: "#탭샵바페어링", color: "#E8A838", description: "와인과 음식 페어링" },
          { id: "scene", name: "#탭샵바씬", color: "#45B26B", description: "촬영·대관·브랜드 활동" },
          { id: "new-menu", name: "#탭샵바뉴", color: "#9B59B6", description: "신메뉴 출시 소개" },
          { id: "monthly-tap", name: "#이달의탭", color: "#E05555", description: "이달의 프로모션 와인" },
          { id: "guide", name: "#탭샵바가이드", color: "#14B8A6", description: "초보자 가이드 시리즈" },
        ]
      : [
          { id: "recipe", name: "레시피/제품", color: "#10b981" },
          { id: "branding", name: "브랜딩", color: "#3b82f6" },
          { id: "reels", name: "릴스", color: "#f97316" },
          { id: "seeding", name: "시딩/콜라보", color: "#8b5cf6" },
        ];

    const clientName = client === "tabshopbar"
      ? "탭샵바 (TAP SHOP BAR)"
      : client.replace("huenic-", "").toUpperCase();

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
