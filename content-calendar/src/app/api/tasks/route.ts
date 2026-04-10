import { NextRequest, NextResponse } from "next/server";
import { getTaskBoard, saveTaskBoard } from "@/lib/task-storage";
import type { TaskItem, TeamMember } from "@/data/task-types";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("cc-admin-auth")?.value === "authenticated";
}

// GET — full board (tasks + members)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const board = await getTaskBoard();
  return NextResponse.json(board);
}

// POST — add task or member
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const board = await getTaskBoard();

  if (body.type === "task") {
    const task: TaskItem = {
      id: crypto.randomUUID(),
      projectSlug: body.projectSlug,
      title: body.title,
      assigneeId: body.assigneeId,
      status: body.status || "pending",
      startDate: body.startDate,
      endDate: body.endDate,
      createdAt: new Date().toISOString(),
    };
    board.tasks.push(task);
    await saveTaskBoard(board);
    return NextResponse.json(task, { status: 201 });
  }

  if (body.type === "member") {
    const member: TeamMember = {
      id: crypto.randomUUID(),
      name: body.name,
      role: body.role,
      color: body.color || "#6b7280",
    };
    board.members.push(member);
    await saveTaskBoard(board);
    return NextResponse.json(member, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// PATCH — update task
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const board = await getTaskBoard();
  const idx = board.tasks.findIndex((t) => t.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  board.tasks[idx] = { ...board.tasks[idx], ...body, id: board.tasks[idx].id, createdAt: board.tasks[idx].createdAt };
  await saveTaskBoard(board);
  return NextResponse.json(board.tasks[idx]);
}

// DELETE — remove task
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const board = await getTaskBoard();
  board.tasks = board.tasks.filter((t) => t.id !== id);
  await saveTaskBoard(board);
  return NextResponse.json({ ok: true });
}
