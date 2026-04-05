import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSchedule, saveSchedule } from "@/lib/schedule-storage";
import type { ScheduleData } from "@/data/schedule-types";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("cc-admin-auth")?.value === "authenticated";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientSlug: string }> }
) {
  const { clientSlug } = await params;
  const data = await getSchedule(clientSlug);
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientSlug: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { clientSlug } = await params;
  const data = (await req.json()) as ScheduleData;
  await saveSchedule(clientSlug, data);
  return NextResponse.json({ success: true });
}
