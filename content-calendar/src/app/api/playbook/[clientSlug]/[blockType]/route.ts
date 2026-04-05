import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPlaybook, savePlaybook } from "@/lib/playbook-storage";
import { PLAYBOOK_TEMPLATES, type Playbook } from "@/data/playbook-types";

export const dynamic = "force-dynamic";

async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("cc-admin-auth")?.value === "authenticated";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientSlug: string; blockType: string }> }
) {
  const { clientSlug, blockType } = await params;
  const data = await getPlaybook(clientSlug, blockType);
  return NextResponse.json(data);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientSlug: string; blockType: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { clientSlug, blockType } = await params;
  const data = (await req.json()) as Playbook;
  await savePlaybook(clientSlug, blockType, data);
  return NextResponse.json({ success: true });
}

// POST = create from template
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ clientSlug: string; blockType: string }> }
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { clientSlug, blockType } = await params;

  const template = PLAYBOOK_TEMPLATES[blockType];
  if (!template) {
    return NextResponse.json({ error: "No template for this block type" }, { status: 400 });
  }

  const playbook: Playbook = {
    clientSlug,
    blockType,
    templateId: blockType,
    startDate: new Date().toISOString().slice(0, 10),
    phases: JSON.parse(JSON.stringify(template.phases)),
  };

  await savePlaybook(clientSlug, blockType, playbook);
  return NextResponse.json(playbook);
}
