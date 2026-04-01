import { NextRequest, NextResponse } from "next/server";
import { getWeeklyReport, saveWeeklyReport } from "@/lib/huenic-storage";
import { fetchWeeklyReportFromSheets } from "@/lib/google-sheets";
import type { HuenicBrand } from "@/data/huenic-types";

export const dynamic = "force-dynamic";

function validBrand(b: string): HuenicBrand {
  return b === "veggiet" || b === "vinker" ? b : "veggiet";
}

// week param format: "2026-4월-1w"
function parseWeek(week: string): { year: number; month: number; week: number } | null {
  const match = week.match(/^(\d{4})-(\d{1,2})월-(\d)w$/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10), week: parseInt(match[3], 10) };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brand: string; week: string }> }
) {
  const { brand: rawBrand, week: rawWeek } = await params;
  const brand = validBrand(rawBrand);
  const parsed = parseWeek(decodeURIComponent(rawWeek));
  if (!parsed) {
    return NextResponse.json({ error: "Invalid week format. Use YYYY-N월-Nw" }, { status: 400 });
  }

  const sheetWeekStr = `${parsed.month}월 ${parsed.week}w`;

  // 1. Try Google Sheets (metrics + top content)
  const sheetsData = await fetchWeeklyReportFromSheets(brand, sheetWeekStr);

  // 2. Get Blob data (coach comment + next week plan)
  // Blob key: year-month-week (e.g. 2026-4-1)
  const blobKey = parsed.month * 10 + parsed.week;
  const blobData = await getWeeklyReport(brand, parsed.year, blobKey);

  // 3. Merge: sheets metrics + blob comments/plans
  if (sheetsData) {
    const merged = {
      ...sheetsData,
      coachComment: blobData?.coachComment ?? sheetsData.coachComment,
      nextWeekPlan: blobData?.nextWeekPlan?.length
        ? blobData.nextWeekPlan
        : sheetsData.nextWeekPlan,
    };
    return NextResponse.json(merged);
  }

  // 4. Fallback to blob/seed only
  if (blobData) {
    return NextResponse.json(blobData);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brand: string; week: string }> }
) {
  const { brand: rawBrand, week: rawWeek } = await params;
  const brand = validBrand(rawBrand);
  const parsed = parseWeek(decodeURIComponent(rawWeek));
  if (!parsed) {
    return NextResponse.json({ error: "Invalid week format. Use YYYY-N월-Nw" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const blobKey = parsed.month * 10 + parsed.week;
    await saveWeeklyReport(brand, parsed.year, blobKey, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "저장에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
