import { NextRequest, NextResponse } from "next/server";
import { getKpiData, saveKpiData } from "@/lib/huenic-storage";
import { fetchKpiFromSheets } from "@/lib/google-sheets";
import type { HuenicBrand } from "@/data/huenic-types";

export const dynamic = "force-dynamic";

function validBrand(b: string): HuenicBrand | null {
  return b === "veggiet" || b === "vinker" ? b : null;
}

// month param format: "2026-03"
function parseMonth(month: string): { year: number; month: number } | null {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brand: string; month: string }> }
) {
  const { brand: rawBrand, month: rawMonth } = await params;
  const brand = validBrand(rawBrand);
  if (!brand) return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
  const parsed = parseMonth(rawMonth);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 });
  }

  // 1. Try Google Sheets first
  const sheetsData = await fetchKpiFromSheets(brand, parsed.year, parsed.month);
  if (sheetsData) {
    return NextResponse.json(sheetsData);
  }

  // 2. Fallback to blob/seed
  const data = await getKpiData(brand, parsed.year, parsed.month);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brand: string; month: string }> }
) {
  const { brand: rawBrand, month: rawMonth } = await params;
  const brand = validBrand(rawBrand);
  if (!brand) return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
  const parsed = parseMonth(rawMonth);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 });
  }

  try {
    const body = await req.json();
    await saveKpiData(brand, parsed.year, parsed.month, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "저장에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
