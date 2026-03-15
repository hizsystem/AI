import { NextRequest, NextResponse } from "next/server";
import { getWeeklyReport, saveWeeklyReport } from "@/lib/huenic-storage";
import { fetchWeeklyReportFromSheets } from "@/lib/google-sheets";
import type { HuenicBrand } from "@/data/huenic-types";

function validBrand(b: string): HuenicBrand {
  return b === "veggiet" || b === "vinker" ? b : "veggiet";
}

// week param format: "2026-W11"
function parseWeek(week: string): { year: number; week: number } | null {
  const match = week.match(/^(\d{4})-W(\d{1,2})$/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), week: parseInt(match[2], 10) };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brand: string; week: string }> }
) {
  const { brand: rawBrand, week: rawWeek } = await params;
  const brand = validBrand(rawBrand);
  const parsed = parseWeek(rawWeek);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid week format. Use YYYY-WNN" }, { status: 400 });
  }

  // 1. Try Google Sheets (metrics + top content)
  const sheetsData = await fetchWeeklyReportFromSheets(brand, rawWeek);

  // 2. Get Blob data (coach comment + next week plan)
  const blobData = await getWeeklyReport(brand, parsed.year, parsed.week);

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
  const parsed = parseWeek(rawWeek);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid week format. Use YYYY-WNN" }, { status: 400 });
  }

  const body = await req.json();
  await saveWeeklyReport(brand, parsed.year, parsed.week, body);
  return NextResponse.json({ ok: true });
}
