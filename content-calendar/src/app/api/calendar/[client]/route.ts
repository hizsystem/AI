import { NextRequest, NextResponse } from "next/server";
import { listMonths, getCalendar, saveCalendar } from "@/lib/storage";
import type { CalendarData } from "@/data/types";

export const dynamic = "force-dynamic";

// GET /api/calendar/tabshopbar → list available months
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ client: string }> }
) {
  const { client } = await params;
  const months = await listMonths(client);
  return NextResponse.json({ months });
}

// POST /api/calendar/tabshopbar → create new month
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ client: string }> }
) {
  const { client } = await params;
  const { month } = await req.json();

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format (YYYY-MM)" }, { status: 400 });
  }

  // Check if already exists
  const existing = await getCalendar(client, month);
  if (existing) {
    return NextResponse.json({ error: "Month already exists" }, { status: 409 });
  }

  // Find the most recent month to copy categories/moodboard from
  const months = await listMonths(client);
  let template: CalendarData | null = null;
  if (months.length > 0) {
    template = await getCalendar(client, months[months.length - 1]);
  }

  const [year, m] = month.split("-");
  const monthNum = parseInt(m, 10);
  const monthNames = ["", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  const newCalendar: CalendarData = {
    client: template?.client ?? client,
    clientSlug: template?.clientSlug ?? client,
    month,
    title: `${monthNames[monthNum]} 콘텐츠 캘린더`,
    description: template?.description ?? "",
    coreMessage: template?.coreMessage,
    moodboard: template?.moodboard,
    categories: template?.categories ?? [],
    items: [],
  };

  await saveCalendar(client, month, newCalendar);
  return NextResponse.json(newCalendar, { status: 201 });
}
