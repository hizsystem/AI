import { NextRequest, NextResponse } from "next/server";
import { getTaskBoard } from "@/lib/task-storage";
import type { TaskItem, TeamMember } from "@/data/task-types";

// Vercel Cron sends Authorization: Bearer <CRON_SECRET>
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (auth && process.env.CRON_SECRET && auth === process.env.CRON_SECRET) return true;
  // Also allow ADMIN_PASSWORD for manual testing
  if (auth && process.env.ADMIN_PASSWORD && auth === process.env.ADMIN_PASSWORD) return true;
  return false;
}

const PROJECT_META: Record<string, { name: string; emoji: string }> = {
  huenic: { name: "HUENIC", emoji: "🌱" },
  "mirye-gukbap": { name: "미례국밥", emoji: "🍲" },
  dancingcup: { name: "댄싱컵", emoji: "💃" },
  goventure: { name: "고벤처포럼", emoji: "🚀" },
  brandrise: { name: "브랜드라이즈", emoji: "✦" },
  hdoilbank: { name: "HD현대오일뱅크", emoji: "⛽" },
  myeongdong: { name: "명동식당", emoji: "🍜" },
};

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatShort(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function buildDailyBrief(tasks: TaskItem[], members: TeamMember[]): string {
  const now = new Date();
  // KST (UTC+9)
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = new Date(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = toYMD(today);
  const yesterdayStr = toYMD(yesterday);
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const activeTasks = tasks.filter((t) => t.status !== "done");

  // 오늘 마감: endDate ≤ 오늘 (지연 포함)
  const dueTodayTasks = activeTasks.filter((t) => t.endDate <= todayStr);
  // 신규: createdAt이 어제 이후
  const newTasks = tasks.filter((t) => t.createdAt >= yesterdayStr);

  const lines: string[] = [
    `*📋 BC3T Daily Brief* (${formatShort(today)} ${dayNames[today.getDay()]})`,
    "",
  ];

  // ── 오늘 마감 ──
  if (dueTodayTasks.length > 0) {
    lines.push(`*🔴 오늘 마감 (${dueTodayTasks.length}건)*`);
    for (const task of dueTodayTasks) {
      const meta = PROJECT_META[task.projectSlug] || { name: task.projectSlug, emoji: "📁" };
      const member = members.find((m) => m.id === task.assigneeId);
      const overdue = task.endDate < todayStr ? " ⚠️" : "";
      lines.push(`  ${meta.emoji} ${meta.name}: ${task.title} — ${member?.name || "미정"}${overdue}`);
    }
  } else {
    lines.push(`*✅ 오늘 마감 태스크 없음*`);
  }
  lines.push("");

  // ── 신규 태스크 ──
  if (newTasks.length > 0) {
    lines.push(`*🆕 신규 태스크 (${newTasks.length}건)*`);
    for (const task of newTasks) {
      const meta = PROJECT_META[task.projectSlug] || { name: task.projectSlug, emoji: "📁" };
      const member = members.find((m) => m.id === task.assigneeId);
      const endDate = new Date(task.endDate + "T00:00:00");
      lines.push(`  ${meta.emoji} ${meta.name}: ${task.title} — ${member?.name || "미정"} (~${formatShort(endDate)})`);
    }
  } else {
    lines.push(`*🆕 신규 태스크 없음*`);
  }

  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhookUrl = process.env.SLACK_TASK_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "SLACK_TASK_WEBHOOK_URL not configured" }, { status: 503 });
  }

  try {
    const board = await getTaskBoard();
    const text = buildDailyBrief(board.tasks, board.members);

    const slackRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!slackRes.ok) {
      const body = await slackRes.text();
      return NextResponse.json({ error: "Slack send failed", detail: body }, { status: 502 });
    }

    return NextResponse.json({ ok: true, preview: text });
  } catch (e) {
    console.error("Daily brief cron error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
