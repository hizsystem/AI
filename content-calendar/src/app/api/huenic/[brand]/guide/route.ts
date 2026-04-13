import { NextRequest, NextResponse } from "next/server";
import { getGuideData, saveGuideData } from "@/lib/huenic-storage";
import type { HuenicBrand } from "@/data/huenic-types";

export const dynamic = "force-dynamic";

function validBrand(b: string): HuenicBrand | null {
  return b === "veggiet" || b === "vinker" ? b : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  const { brand: rawBrand } = await params;
  const brand = validBrand(rawBrand);
  if (!brand) return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
  const data = await getGuideData(brand);
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  const { brand: rawBrand } = await params;
  const brand = validBrand(rawBrand);
  if (!brand) return NextResponse.json({ error: "Invalid brand" }, { status: 400 });

  try {
    const body = await req.json();
    await saveGuideData(brand, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "저장에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
