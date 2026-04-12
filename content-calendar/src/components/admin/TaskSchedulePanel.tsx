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

// ─── Add Task Modal ───

function AddTaskModal({
  members,
  onAdd,
  onClose,
  preset,
}: {
  members: TeamMember[];
  onAdd: (t: Omit<TaskItem, "id" | "createdAt">) => void;
  onClose: () => void;
  preset?: { projectSlug?: string; category?: string };
}) {
  const [title, setTitle] = useState("");
  const [projectSlug, setProjectSlug] = useState(preset?.projectSlug || "huenic");
  const [category, setCategory] = useState(preset?.category || "");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || "");
  const [startDate, setStartDate] = useState(toYMD(new Date()));
  const [endDate, setEndDate] = useState(toYMD(addDays(new Date(), 7)));
  const [status, setStatus] = useState<TaskStatus>("pending");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), projectSlug, ...(category.trim() ? { category: category.trim() } : {}), assigneeId, status, startDate, endDate });
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

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">프로젝트</label>
            <select
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {Object.entries(PROJECT_META).map(([slug, meta]) => (
                <option key={slug} value={slug}>
                  {meta.emoji} {meta.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">카테고리</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="예: 네이버플레이스"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">담당자</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
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

// ─── Edit Task Modal ───

function EditTaskModal({
  task,
  members,
  onSave,
  onClose,
}: {
  task: TaskItem;
  members: TeamMember[];
  onSave: (updates: Partial<TaskItem>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category || "");
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [projectSlug, setProjectSlug] = useState(task.projectSlug);
  const [startDate, setStartDate] = useState(task.startDate);
  const [endDate, setEndDate] = useState(task.endDate);
  const [status, setStatus] = useState<TaskStatus>(task.status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      id: task.id,
      title: title.trim(),
      category: category.trim() || null,
      assigneeId,
      projectSlug,
      startDate,
      endDate,
      status,
    } as Partial<TaskItem> & { category: string | null });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <h3 className="text-base font-bold text-gray-900">태스크 수정</h3>

        <div>
          <label className="block text-xs text-gray-500 mb-1">태스크</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">프로젝트</label>
            <select
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {Object.entries(PROJECT_META).map(([slug, meta]) => (
                <option key={slug} value={slug}>
                  {meta.emoji} {meta.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">카테고리</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="예: 네이버플레이스"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">담당자</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
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
            저장
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Gantt Row ───

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

  const left = Math.max(0, offsetDays) * dayWidth;
  const clippedStart = Math.max(0, offsetDays);
  const clippedEnd = Math.min(totalDays, offsetDays + span);
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

// ─── Main Panel ───

export default function TaskSchedulePanel({
  projects,
}: {
  projects: { slug: string; name: string; emoji?: string; brandColor: string }[];
}) {
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addPreset, setAddPreset] = useState<{ projectSlug?: string; category?: string } | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [slackSending, setSlackSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);

  // Timeline: 4 weeks before today ~ 4 weeks after
  const today = new Date();
  const timelineStart = addDays(today, -14);
  const totalDays = 56; // 8 weeks
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

  // Scroll to today on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const todayOffset = diffDays(timelineStart, today) * dayWidth - 200;
    scrollRef.current.scrollLeft = Math.max(0, todayOffset);
  }, [board]);

  // Sync scroll between header and body
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
      setAddPreset(null);
      // Auto-expand the project
      setExpanded((prev) => ({ ...prev, [t.projectSlug]: true }));
    }
  }

  async function handleEditTask(updates: Partial<TaskItem>) {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setEditingTask(null);
    await fetchBoard();
  }

  async function handleStatusToggle(task: TaskItem) {
    const next: TaskStatus = task.status === "pending" ? "in-progress" : task.status === "in-progress" ? "done" : "pending";
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: next }),
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

    const groupedSlack = groupByProject(board.tasks);
    const lines: string[] = [
      `*📋 Task Schedule Update* (${toYMD(today)})`,
      "",
    ];

    for (const [slug, tasks] of Object.entries(groupedSlack)) {
      const meta = PROJECT_META[slug] || { name: slug, emoji: "📁" };
      lines.push(`*${meta.emoji} ${meta.name}* (${tasks.length})`);
      const cats = groupByCategory(tasks);
      for (const { category, tasks: catTasks } of cats) {
        if (category) lines.push(`  _${category}_`);
        for (const task of catTasks) {
          const member = board.members.find((m) => m.id === task.assigneeId);
          const statusEmoji = task.status === "done" ? "✅" : task.status === "in-progress" ? "🔵" : "⬜";
          const indent = category ? "    " : "  ";
          lines.push(`${indent}${statusEmoji} ${task.title} | ${member?.name || "미정"} | ${formatShort(toDate(task.startDate))}~${formatShort(toDate(task.endDate))}`);
        }
      }
      lines.push("");
    }

    try {
      const res = await fetch("/api/tasks/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lines.join("\n") }),
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

  function groupByCategory(tasks: TaskItem[]): { category: string; tasks: TaskItem[] }[] {
    const map: Record<string, TaskItem[]> = {};
    for (const t of tasks) {
      const cat = t.category || "";
      (map[cat] ||= []).push(t);
    }
    // Sort: named categories first (alphabetical), uncategorized last
    return Object.entries(map)
      .sort(([a], [b]) => {
        if (!a) return 1;
        if (!b) return -1;
        return a.localeCompare(b);
      })
      .map(([category, tasks]) => ({ category, tasks }));
  }

  function toggleProject(slug: string) {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }

  function toggleCategory(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: prev[key] === undefined ? false : !prev[key] }));
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
  const projectSlugs = projects
    .filter((p) => grouped[p.slug] || true)
    .map((p) => p.slug);

  // Generate day columns
  const days: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    days.push(addDays(timelineStart, i));
  }

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
            onClick={() => setAddPreset({})}
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
          {/* Left column header */}
          <div className="flex-shrink-0 w-[420px] border-r border-gray-100">
            <div className="grid grid-cols-[1fr_80px_72px] gap-0 px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <span>태스크</span>
              <span className="text-center">담당자</span>
              <span className="text-center">진행여부</span>
            </div>
          </div>
          {/* Timeline dates */}
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
                    {d.getDate() === 1 || i === 0
                      ? `${d.getMonth() + 1}월`
                      : dayLabel(d)}
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
          {/* Left panel (task list) */}
          <div className="flex-shrink-0 w-[420px] border-r border-gray-100">
            {projectSlugs.map((slug) => {
              const meta = PROJECT_META[slug] || { name: slug, emoji: "📁", color: "#6b7280" };
              const tasks = grouped[slug] || [];
              const isOpen = expanded[slug];
              const doneCount = tasks.filter((t) => t.status === "done").length;
              const categories = groupByCategory(tasks);
              const hasCategories = categories.some((c) => c.category !== "");

              return (
                <div key={slug}>
                  {/* Project row */}
                  <div className="group/proj flex items-center border-b border-gray-50 hover:bg-gray-50 transition-colors h-[37px]">
                    <button
                      onClick={() => toggleProject(slug)}
                      className="flex-1 flex items-center gap-2 px-4 text-sm h-full"
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
                      <span className="text-xs text-gray-400 ml-auto">
                        {doneCount}/{tasks.length}
                      </span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setAddPreset({ projectSlug: slug }); }}
                      className="opacity-0 group-hover/proj:opacity-100 mr-3 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-all text-sm"
                      title="태스크 추가"
                    >+</button>
                  </div>

                  {/* Category groups or flat task rows */}
                  {isOpen && hasCategories && categories.map(({ category, tasks: catTasks }) => {
                    const catKey = `${slug}::${category}`;
                    const isCatOpen = expanded[catKey] !== false; // default open
                    const catDone = catTasks.filter((t) => t.status === "done").length;

                    return (
                      <div key={catKey}>
                        {/* Category header */}
                        {category && (
                          <div className="group/cat flex items-center bg-gray-50 hover:bg-gray-100/80 transition-colors border-b border-gray-200/60 h-[33px]">
                            <button
                              onClick={() => toggleCategory(catKey)}
                              className="flex-1 flex items-center gap-2 px-4 pl-7 text-xs h-full"
                            >
                              <svg
                                className={`w-3 h-3 text-gray-400 transition-transform ${isCatOpen ? "rotate-90" : ""}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                              </svg>
                              <span className="font-semibold text-gray-600">{category}</span>
                              <span className="text-[10px] text-gray-400 ml-auto">
                                {catDone}/{catTasks.length}
                              </span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setAddPreset({ projectSlug: slug, category }); }}
                              className="opacity-0 group-hover/cat:opacity-100 mr-3 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-all text-xs"
                              title="태스크 추가"
                            >+</button>
                          </div>
                        )}

                        {/* Tasks in category */}
                        {(category ? isCatOpen : true) && catTasks.map((task) => {
                          const member = board.members.find((m) => m.id === task.assigneeId);
                          const sc = TASK_STATUS_COLORS[task.status];

                          return (
                            <div
                              key={task.id}
                              className="group grid grid-cols-[1fr_80px_72px] gap-0 items-center px-4 border-b border-gray-50 hover:bg-gray-50/50 h-8"
                            >
                              <div className={`flex items-center gap-2 min-w-0 ${category ? "pl-9" : "pl-5"}`}>
                                <span
                                  className="text-sm text-gray-700 truncate cursor-pointer hover:text-gray-900 hover:underline"
                                  onClick={() => setEditingTask(task)}
                                >{task.title}</span>
                                <button
                                  onClick={() => handleDelete(task.id)}
                                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity ml-auto flex-shrink-0"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                {member && (
                                  <>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.color }} />
                                    <span className="text-xs text-gray-600">{member.name}</span>
                                  </>
                                )}
                              </div>
                              <button
                                onClick={() => handleStatusToggle(task)}
                                className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.bg} ${sc.text} hover:opacity-80 transition-opacity`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {TASK_STATUS_LABELS[task.status]}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Flat task rows (no categories at all) */}
                  {isOpen && !hasCategories && tasks.map((task) => {
                    const member = board.members.find((m) => m.id === task.assigneeId);
                    const sc = TASK_STATUS_COLORS[task.status];

                    return (
                      <div
                        key={task.id}
                        className="group grid grid-cols-[1fr_80px_72px] gap-0 items-center px-4 border-b border-gray-50 hover:bg-gray-50/50 h-8"
                      >
                        <div className="flex items-center gap-2 min-w-0 pl-5">
                          <span
                                  className="text-sm text-gray-700 truncate cursor-pointer hover:text-gray-900 hover:underline"
                                  onClick={() => setEditingTask(task)}
                                >{task.title}</span>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity ml-auto flex-shrink-0"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          {member && (
                            <>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.color }} />
                              <span className="text-xs text-gray-600">{member.name}</span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handleStatusToggle(task)}
                          className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${sc.bg} ${sc.text} hover:opacity-80 transition-opacity`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {TASK_STATUS_LABELS[task.status]}
                        </button>
                      </div>
                    );
                  })}

                  {/* Empty state */}
                  {isOpen && tasks.length === 0 && (
                    <div className="px-4 pl-9 text-xs text-gray-300 border-b border-gray-50 h-[37px] flex items-center">
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
                const categories = groupByCategory(tasks);
                const hasCategories = categories.some((c) => c.category !== "");

                return (
                  <div key={slug}>
                    {/* Project row spacer */}
                    <div className="h-[37px] border-b border-gray-50 relative">
                      {days.map((d, i) =>
                        isToday(d) ? (
                          <div
                            key={`today-${i}`}
                            className="absolute top-0 bottom-0 w-px bg-blue-300 z-10"
                            style={{ left: `${i * dayWidth + dayWidth / 2}px` }}
                          />
                        ) : null
                      )}
                    </div>

                    {/* Category-grouped gantt bars */}
                    {isOpen && hasCategories && categories.map(({ category, tasks: catTasks }) => {
                      const catKey = `${slug}::${category}`;
                      const isCatOpen = expanded[catKey] !== false;

                      return (
                        <div key={catKey}>
                          {/* Category header spacer */}
                          {category && (
                            <div className="h-[33px] border-b border-gray-200/60 relative bg-gray-50">
                              {days.map((d, i) =>
                                isToday(d) ? (
                                  <div
                                    key={`today-${i}`}
                                    className="absolute top-0 bottom-0 w-px bg-blue-300 z-10"
                                    style={{ left: `${i * dayWidth + dayWidth / 2}px` }}
                                  />
                                ) : null
                              )}
                            </div>
                          )}

                          {/* Task bars in category */}
                          {(category ? isCatOpen : true) && catTasks.map((task) => {
                            const member = board.members.find((m) => m.id === task.assigneeId);
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
                                {days.map((d, i) =>
                                  isToday(d) ? (
                                    <div
                                      key={`today-${i}`}
                                      className="absolute top-0 bottom-0 w-px bg-blue-300 z-10"
                                      style={{ left: `${i * dayWidth + dayWidth / 2}px` }}
                                    />
                                  ) : null
                                )}
                                <GanttBar
                                  task={task}
                                  timelineStart={timelineStart}
                                  dayWidth={dayWidth}
                                  totalDays={totalDays}
                                  member={member}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Flat gantt bars (no categories) */}
                    {isOpen && !hasCategories && tasks.map((task) => {
                      const member = board.members.find((m) => m.id === task.assigneeId);
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
                          {days.map((d, i) =>
                            isToday(d) ? (
                              <div
                                key={`today-${i}`}
                                className="absolute top-0 bottom-0 w-px bg-blue-300 z-10"
                                style={{ left: `${i * dayWidth + dayWidth / 2}px` }}
                              />
                            ) : null
                          )}
                          <GanttBar
                            task={task}
                            timelineStart={timelineStart}
                            dayWidth={dayWidth}
                            totalDays={totalDays}
                            member={member}
                          />
                        </div>
                      );
                    })}

                    {/* Empty spacer */}
                    {isOpen && tasks.length === 0 && (
                      <div className="h-[37px] border-b border-gray-50" />
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
          <div className="w-3 h-px bg-blue-300" /> 오늘
        </div>
      </div>

      {/* Add Task Modal */}
      {addPreset && (
        <AddTaskModal
          members={board.members}
          onAdd={handleAddTask}
          onClose={() => setAddPreset(null)}
          preset={addPreset}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          members={board.members}
          onSave={handleEditTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
