"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { TaskBoard, TaskItem, TaskStatus, TeamMember } from "@/data/task-types";
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, DEFAULT_MEMBERS } from "@/data/task-types";

// ─── Helpers ───

function toDate(s: string) { return new Date(s + "T00:00:00"); }

function formatShort(d: Date) {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function dayLabel(d: Date) {
  return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
}

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isWeekend(d: Date) { return d.getDay() === 0 || d.getDay() === 6; }
function isToday(d: Date) { return toYMD(d) === toYMD(new Date()); }

// ─── Project configs (slug → display) ───

const PROJECT_META: Record<string, { name: string; emoji: string; color: string }> = {
  huenic: { name: "HUENIC", emoji: "🌱", color: "#10b981" },
  "mirye-gukbap": { name: "미례국밥", emoji: "🍲", color: "#d97706" },
  dancingcup: { name: "댄싱컵", emoji: "💃", color: "#ec4899" },
  goventure: { name: "고벤처포럼", emoji: "🚀", color: "#1e40af" },
  brandrise: { name: "브랜드라이즈", emoji: "✦", color: "#111827" },
  hdoilbank: { name: "HD현대오일뱅크", emoji: "⛽", color: "#dc2626" },
  myeongdong: { name: "명동식당", emoji: "🍜", color: "#b45309" },
};

// ─── Inline Quick Add Row ───

function QuickAddRow({
  projectSlug,
  members,
  onAdd,
}: {
  projectSlug: string;
  members: TeamMember[];
  onAdd: (t: Omit<TaskItem, "id" | "createdAt">) => void;
}) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && title.trim()) {
      onAdd({
        title: title.trim(),
        projectSlug,
        assigneeId: members[0]?.id || "",
        status: "pending",
        startDate: toYMD(new Date()),
        endDate: toYMD(addDays(new Date(), 7)),
      });
      setTitle("");
    }
    if (e.key === "Escape") {
      setTitle("");
      inputRef.current?.blur();
    }
  }

  return (
    <div className="grid grid-cols-[1fr_80px_80px] gap-0 items-center px-4 py-1.5 border-b border-gray-50">
      <div className="pl-5">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="+ 새 태스크 입력 후 Enter"
          className="w-full text-sm text-gray-400 placeholder:text-gray-300 bg-transparent outline-none focus:text-gray-700"
        />
      </div>
      <div />
      <div />
    </div>
  );
}

// ─── Popover Dropdown ───

function Popover({
  trigger,
  open,
  onClose,
  children,
}: {
  trigger: React.ReactNode;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      {trigger}
      {open && (
        <div className="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] left-1/2 -translate-x-1/2">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Inline Edit Row ───

function EditableTaskRow({
  task,
  members,
  onUpdate,
  onDelete,
}: {
  task: TaskItem;
  members: TeamMember[];
  onUpdate: (id: string, patch: Partial<TaskItem>) => void;
  onDelete: (id: string) => void;
}) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState(task.title);
  const member = members.find((m) => m.id === task.assigneeId);
  const sc = TASK_STATUS_COLORS[task.status];

  function commitTitle() {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() });
    } else {
      setEditTitle(task.title);
    }
    setEditingField(null);
  }

  return (
    <div className="group grid grid-cols-[1fr_80px_80px] gap-0 items-center px-4 py-2 border-b border-gray-50 hover:bg-gray-50/50">
      {/* Task name — click to edit inline */}
      <div className="flex items-center gap-2 min-w-0 pl-5">
        {editingField === "title" ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") { setEditTitle(task.title); setEditingField(null); } }}
            className="flex-1 text-sm text-gray-700 bg-white border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-gray-300"
          />
        ) : (
          <span
            onClick={() => { setEditingField("title"); setEditTitle(task.title); }}
            className="text-sm text-gray-700 truncate cursor-text hover:text-gray-900"
          >
            {task.title}
          </span>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity ml-auto flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Assignee — click to open popover */}
      <div className="flex items-center justify-center">
        <Popover
          open={editingField === "assignee"}
          onClose={() => setEditingField(null)}
          trigger={
            <button
              onClick={() => setEditingField(editingField === "assignee" ? null : "assignee")}
              className="flex items-center gap-1.5 hover:bg-gray-100 rounded-md px-2 py-1 transition-colors"
            >
              {member && (
                <>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }} />
                  <span className="text-xs text-gray-600 whitespace-nowrap">{member.name}</span>
                </>
              )}
            </button>
          }
        >
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => { onUpdate(task.id, { assigneeId: m.id }); setEditingField(null); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                m.id === task.assigneeId ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
              }`}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
              <span>{m.name}</span>
              {m.id === task.assigneeId && (
                <svg className="w-3 h-3 ml-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </Popover>
      </div>

      {/* Status — click to open popover */}
      <div className="flex items-center justify-center">
        <Popover
          open={editingField === "status"}
          onClose={() => setEditingField(null)}
          trigger={
            <button
              onClick={() => setEditingField(editingField === "status" ? null : "status")}
              className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${sc.bg} ${sc.text} hover:opacity-80 transition-opacity`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {TASK_STATUS_LABELS[task.status]}
            </button>
          }
        >
          {(["pending", "in-progress", "done"] as TaskStatus[]).map((s) => {
            const c = TASK_STATUS_COLORS[s];
            return (
              <button
                key={s}
                onClick={() => { onUpdate(task.id, { status: s }); setEditingField(null); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                  s === task.status ? `${c.bg} font-medium` : "text-gray-700"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={s === task.status ? c.text : ""}>{TASK_STATUS_LABELS[s]}</span>
                {s === task.status && (
                  <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </Popover>
      </div>
    </div>
  );
}

// ─── Gantt Bar ───

function GanttBar({
  task,
  timelineStart,
  dayWidth,
  totalDays,
  member,
}: {
  task: TaskItem;
  timelineStart: Date;
  dayWidth: number;
  totalDays: number;
  member?: TeamMember;
}) {
  const start = toDate(task.startDate);
  const end = toDate(task.endDate);
  const offsetDays = diffDays(timelineStart, start);
  const span = diffDays(start, end) + 1;

  const clippedStart = Math.max(0, offsetDays);
  const clippedEnd = Math.min(totalDays, offsetDays + span);
  const left = clippedStart * dayWidth;
  const width = Math.max(0, clippedEnd - clippedStart) * dayWidth;

  if (width <= 0) return null;

  const color = member?.color || "#6b7280";

  return (
    <div
      className="absolute top-1 rounded-md h-6 flex items-center px-2 text-[10px] font-medium text-white truncate"
      style={{
        left: `${left}px`,
        width: `${width}px`,
        backgroundColor: task.status === "done" ? "#d1d5db" : color,
        opacity: task.status === "done" ? 0.6 : 1,
      }}
      title={`${task.title} (${formatShort(start)}~${formatShort(end)})`}
    >
      {width > 60 ? task.title : ""}
    </div>
  );
}

// ─── Today Line (rendered once per column) ───

function TodayLine({ days, dayWidth }: { days: Date[]; dayWidth: number }) {
  const idx = days.findIndex((d) => isToday(d));
  if (idx === -1) return null;
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-blue-400 z-10 pointer-events-none"
      style={{ left: `${idx * dayWidth + dayWidth / 2}px` }}
    />
  );
}

// ─── Main Panel ───

export default function TaskSchedulePanel({
  projects,
  onToggleWide,
  isWide,
}: {
  projects: { slug: string; name: string; emoji?: string; brandColor: string }[];
  onToggleWide?: () => void;
  isWide?: boolean;
}) {
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [slackSending, setSlackSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const timelineStart = addDays(today, -14);
  const totalDays = 56;
  const dayWidth = 36;

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) setBoard(await res.json());
    } catch (e) {
      console.error("Task fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  useEffect(() => {
    if (!scrollRef.current) return;
    const todayOffset = diffDays(timelineStart, today) * dayWidth - 200;
    scrollRef.current.scrollLeft = Math.max(0, todayOffset);
  }, [board]);

  function handleScroll() {
    if (scrollRef.current && headerScrollRef.current) {
      headerScrollRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  }

  async function handleAddTask(t: Omit<TaskItem, "id" | "createdAt">) {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "task", ...t }),
    });
    if (res.ok) {
      await fetchBoard();
      setShowAdd(false);
      setExpanded((prev) => ({ ...prev, [t.projectSlug]: true }));
    }
  }

  async function handleUpdateTask(id: string, patch: Partial<TaskItem>) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    await fetchBoard();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    await fetchBoard();
  }

  async function handleSlackShare() {
    if (!board) return;
    setSlackSending(true);

    const grouped = groupByProject(board.tasks);
    const inProgress = board.tasks.filter((t) => t.status === "in-progress").length;
    const done = board.tasks.filter((t) => t.status === "done").length;
    const pending = board.tasks.filter((t) => t.status === "pending").length;

    // Slack Block Kit format
    const blocks: object[] = [
      {
        type: "header",
        text: { type: "plain_text", text: `📋 Task Schedule  ·  ${toYMD(today)}` },
      },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `🔵 진행 *${inProgress}*  ·  ⬜ 대기 *${pending}*  ·  ✅ 완료 *${done}*` },
        ],
      },
      { type: "divider" },
    ];

    for (const [slug, tasks] of Object.entries(grouped)) {
      const meta = PROJECT_META[slug] || { name: slug, emoji: "📁" };
      const taskLines = tasks.map((task) => {
        const m = board.members.find((m) => m.id === task.assigneeId);
        const emoji = task.status === "done" ? "✅" : task.status === "in-progress" ? "🔵" : "⬜";
        return `${emoji}  ${task.title}  ·  ${m?.name || "미정"}  ·  ${formatShort(toDate(task.startDate))}~${formatShort(toDate(task.endDate))}`;
      });

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${meta.emoji} ${meta.name}*  (${tasks.length})\n${taskLines.join("\n")}`,
        },
      });
    }

    blocks.push(
      { type: "divider" },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `<https://hiz-brand-dashboard.vercel.app/admin|📊 대시보드에서 보기>` },
        ],
      }
    );

    try {
      const res = await fetch("/api/tasks/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (res.status === 503) alert("Slack 웹훅이 설정되지 않았습니다.\nSLACK_TASK_WEBHOOK_URL 환경변수를 추가해주세요.");
      else if (!res.ok) alert("Slack 전송 실패");
    } catch {
      alert("Slack 전송 오류");
    } finally {
      setSlackSending(false);
    }
  }

  function groupByProject(tasks: TaskItem[]): Record<string, TaskItem[]> {
    const map: Record<string, TaskItem[]> = {};
    for (const t of tasks) {
      (map[t.projectSlug] ||= []).push(t);
    }
    return map;
  }

  function toggleProject(slug: string) {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    );
  }

  if (!board) return null;

  const grouped = groupByProject(board.tasks);
  const projectSlugs = projects.filter((p) => grouped[p.slug] || true).map((p) => p.slug);

  const days: Date[] = [];
  for (let i = 0; i < totalDays; i++) days.push(addDays(timelineStart, i));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Task Schedule</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {board.tasks.length}개 태스크 · {board.tasks.filter((t) => t.status === "in-progress").length}개 진행중
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Wide toggle */}
          {onToggleWide && (
            <button
              onClick={onToggleWide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              title={isWide ? "기본 보기" : "넓게 보기"}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isWide ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                )}
              </svg>
              {isWide ? "기본" : "넓게"}
            </button>
          )}
          <button
            onClick={handleSlackShare}
            disabled={slackSending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
            </svg>
            {slackSending ? "전송중..." : "Slack 공유"}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            <span className="text-sm leading-none">+</span> 태스크 추가
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b border-gray-100">
          <div className="flex-shrink-0 w-[420px] border-r border-gray-100">
            <div className="grid grid-cols-[1fr_80px_80px] gap-0 px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <span>태스크</span>
              <span className="text-center">담당자</span>
              <span className="text-center">진행여부</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden" ref={headerScrollRef}>
            <div className="flex" style={{ width: `${totalDays * dayWidth}px` }}>
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 text-center py-2 border-r border-gray-50 ${
                    isToday(d) ? "bg-blue-50" : isWeekend(d) ? "bg-gray-50/50" : ""
                  }`}
                  style={{ width: `${dayWidth}px` }}
                >
                  <div className={`text-[10px] ${isToday(d) ? "text-blue-600 font-bold" : "text-gray-300"}`}>
                    {d.getDate() === 1 || i === 0 ? `${d.getMonth() + 1}월` : dayLabel(d)}
                  </div>
                  <div className={`text-xs font-medium ${isToday(d) ? "text-blue-600" : isWeekend(d) ? "text-gray-300" : "text-gray-500"}`}>
                    {d.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Left panel */}
          <div className="flex-shrink-0 w-[420px] border-r border-gray-100">
            {projectSlugs.map((slug) => {
              const meta = PROJECT_META[slug] || { name: slug, emoji: "📁", color: "#6b7280" };
              const tasks = grouped[slug] || [];
              const isOpen = expanded[slug];
              const doneCount = tasks.filter((t) => t.status === "done").length;

              return (
                <div key={slug}>
                  {/* Project toggle */}
                  <button
                    onClick={() => toggleProject(slug)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50"
                  >
                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                    </svg>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="font-medium text-gray-900">{meta.emoji} {meta.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{doneCount}/{tasks.length}</span>
                  </button>

                  {/* Editable task rows */}
                  {isOpen && tasks.map((task) => (
                    <EditableTaskRow
                      key={task.id}
                      task={task}
                      members={board.members}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDelete}
                    />
                  ))}

                  {/* Quick add row (Notion style) */}
                  {isOpen && (
                    <QuickAddRow
                      projectSlug={slug}
                      members={board.members}
                      onAdd={handleAddTask}
                    />
                  )}

                  {/* Empty state */}
                  {isOpen && tasks.length === 0 && (
                    <div className="px-4 py-2 pl-9 text-xs text-gray-300 border-b border-gray-50">
                      태스크가 없습니다
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right panel (timeline) */}
          <div className="flex-1 overflow-x-auto" ref={scrollRef} onScroll={handleScroll}>
            <div style={{ width: `${totalDays * dayWidth}px` }}>
              {projectSlugs.map((slug) => {
                const tasks = grouped[slug] || [];
                const isOpen = expanded[slug];

                return (
                  <div key={slug}>
                    {/* Project row spacer */}
                    <div className="h-[37px] border-b border-gray-50 relative">
                      <TodayLine days={days} dayWidth={dayWidth} />
                    </div>

                    {/* Task bars */}
                    {isOpen && tasks.map((task) => {
                      const m = board.members.find((m) => m.id === task.assigneeId);
                      return (
                        <div key={task.id} className="h-8 border-b border-gray-50 relative">
                          {days.map((d, i) => (
                            <div
                              key={i}
                              className={`absolute top-0 bottom-0 border-r border-gray-50 ${
                                isToday(d) ? "bg-blue-50/50" : isWeekend(d) ? "bg-gray-50/30" : ""
                              }`}
                              style={{ left: `${i * dayWidth}px`, width: `${dayWidth}px` }}
                            />
                          ))}
                          <TodayLine days={days} dayWidth={dayWidth} />
                          <GanttBar task={task} timelineStart={timelineStart} dayWidth={dayWidth} totalDays={totalDays} member={m} />
                        </div>
                      );
                    })}

                    {/* Quick add spacer */}
                    {isOpen && (
                      <div className="h-[31px] border-b border-gray-50 relative">
                        <TodayLine days={days} dayWidth={dayWidth} />
                      </div>
                    )}

                    {/* Empty spacer */}
                    {isOpen && tasks.length === 0 && (
                      <div className="h-[33px] border-b border-gray-50 relative">
                        <TodayLine days={days} dayWidth={dayWidth} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-300" /> 대기
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-400" /> 진행중
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" /> 완료
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-px bg-blue-400" /> 오늘
        </div>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <AddTaskModal
          members={board.members}
          onAdd={handleAddTask}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

// ─── Add Task Modal ───

function AddTaskModal({
  members,
  onAdd,
  onClose,
}: {
  members: TeamMember[];
  onAdd: (t: Omit<TaskItem, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [projectSlug, setProjectSlug] = useState("huenic");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || "");
  const [startDate, setStartDate] = useState(toYMD(new Date()));
  const [endDate, setEndDate] = useState(toYMD(addDays(new Date(), 7)));
  const [status, setStatus] = useState<TaskStatus>("pending");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), projectSlug, assigneeId, status, startDate, endDate });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <h3 className="text-base font-bold text-gray-900">태스크 추가</h3>

        <div>
          <label className="block text-xs text-gray-500 mb-1">태스크</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            placeholder="태스크명 입력"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">프로젝트</label>
            <select
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {Object.entries(PROJECT_META).map(([slug, meta]) => (
                <option key={slug} value={slug}>{meta.emoji} {meta.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">담당자</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">진행여부</label>
          <div className="flex gap-2">
            {(["pending", "in-progress", "done"] as TaskStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  status === s
                    ? `${TASK_STATUS_COLORS[s].bg} ${TASK_STATUS_COLORS[s].text} ring-1 ring-current/20`
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {TASK_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            취소
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-40"
          >
            추가
          </button>
        </div>
      </form>
    </div>
  );
}
