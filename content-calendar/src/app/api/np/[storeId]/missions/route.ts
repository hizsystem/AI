import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getNpMissions, saveNpMissions } from "@/lib/np-storage";
import type { NpMissionsData } from "@/data/np-types";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("cc-admin-auth")?.value === "authenticated";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeId } = await params;
  const data = await getNpMissions(storeId);
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeId } = await params;
  const data = (await req.json()) as NpMissionsData;
  await saveNpMissions(storeId, data);
  return NextResponse.json({ success: true });
}
