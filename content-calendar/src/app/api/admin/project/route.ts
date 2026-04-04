import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProjectConfig, saveProjectConfig, listProjectConfigs } from "@/lib/client-config-storage";
import type { ProjectConfig } from "@/data/client-config";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("cc-admin-auth")?.value === "authenticated";
}

// GET — list all projects
export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const configs = await listProjectConfigs();
  return NextResponse.json(configs);
}

// PUT — update a project config
export async function PUT(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = (await req.json()) as ProjectConfig;
  if (!config.slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  await saveProjectConfig(config);
  return NextResponse.json({ success: true });
}

// POST — create a new project
export async function POST(req: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = (await req.json()) as ProjectConfig;
  if (!config.slug || !config.name) {
    return NextResponse.json({ error: "slug and name required" }, { status: 400 });
  }

  // Check if already exists
  const existing = await getProjectConfig(config.slug);
  if (existing) {
    return NextResponse.json({ error: "Project already exists" }, { status: 409 });
  }

  await saveProjectConfig(config);
  return NextResponse.json({ success: true });
}
