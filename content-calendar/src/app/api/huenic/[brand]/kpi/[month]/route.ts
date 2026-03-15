import { NextRequest, NextResponse } from "next/server";
import { getKpiData, saveKpiData } from "@/lib/huenic-storage";
import { fetchKpiFromSheets } from "@/lib/google-sheets";
import type { HuenicBrand } from "@/data/huenic-types";

function validBrand(b: string): HuenicBrand {
  return b === "veggiet" || b === "vinker" ? b : "veggiet";
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
  const parsed = parseMonth(rawMonth);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 });
  }

  const body = await req.json();
  await saveKpiData(brand, parsed.year, parsed.month, body);
  return NextResponse.json({ ok: true });
}
