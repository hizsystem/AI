"use client";

import { useState, useEffect } from "react";
import type { Playbook, PlaybookPhase } from "@/data/playbook-types";

interface PlaybookPanelProps {
  clientSlug: string;
  blockType: string;
  blockLabel: string;
}

export default function PlaybookPanel({ clientSlug, blockType, blockLabel }: PlaybookPanelProps) {
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/playbook/${clientSlug}/${blockType}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => setPlaybook(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clientSlug, blockType]);

  async function handleCreate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/playbook/${clientSlug}/${blockType}`, { method: "POST" });
      if (res.ok) setPlaybook(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(phaseId: string, taskId: string) {
    if (!playbook) return;
    const updated: Playbook = {
      ...playbook,
      phases: playbook.phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              tasks: phase.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : phase
      ),
    };
    setPlaybook(updated);

    await fetch(`/api/playbook/${clientSlug}/${blockType}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  if (loading) return <div className="text-center py-8 text-sm text-gray-400">로딩 중...</div>;

  if (!playbook) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500 mb-4">{blockLabel} 플레이북이 아직 없습니다</p>
        <button
          onClick={handleCreate}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          표준 플레이북 시작
        </button>
      </div>
    );
  }

  async function handleReset() {
    if (!confirm("플레이북을 초기화하시겠습니까? 진행 상황이 모두 리셋됩니다.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/playbook/${clientSlug}/${blockType}`, { method: "POST" });
      if (res.ok) setPlaybook(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("플레이북을 삭제하시겠습니까?")) return;
    await fetch(`/api/playbook/${clientSlug}/${blockType}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(null),
    });
    setPlaybook(null);
  }

  // Calculate progress
  const allTasks = playbook.phases.flatMap((p) => p.tasks);
  const completedCount = allTasks.filter((t) => t.completed).length;
  const totalCount = allTasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">전체 진행률</span>
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="text-[10px] text-gray-400 hover:text-amber-500 transition-colors">초기화</button>
            <button onClick={handleDelete} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">삭제</button>
            <span className="text-sm font-bold text-gray-900">{pct}%</span>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-gray-400">{completedCount} / {totalCount} 완료</span>
          <span className="text-[11px] text-gray-400">시작일: {playbook.startDate}</span>
        </div>
      </div>

      {/* Phases */}
      {playbook.phases.map((phase) => {
        const phaseComplete = phase.tasks.filter((t) => t.completed).length;
        const phaseTotal = phase.tasks.length;
        const phasePct = phaseTotal > 0 ? Math.round((phaseComplete / phaseTotal) * 100) : 0;

        return (
          <PhaseSection
            key={phase.id}
            phase={phase}
            phasePct={phasePct}
            phaseComplete={phaseComplete}
            phaseTotal={phaseTotal}
            onToggle={(taskId) => toggleTask(phase.id, taskId)}
          />
        );
      })}
    </div>
  );
}

function PhaseSection({
  phase,
  phasePct,
  phaseComplete,
  phaseTotal,
  onToggle,
}: {
  phase: PlaybookPhase;
  phasePct: number;
  phaseComplete: number;
  phaseTotal: number;
  onToggle: (taskId: string) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Phase header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{phase.title}</h4>
          {phase.description && (
            <p className="text-[11px] text-gray-400 mt-0.5">{phase.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">{phaseComplete}/{phaseTotal}</span>
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${phasePct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
              style={{ width: `${phasePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="divide-y divide-gray-50">
        {phase.tasks.map((task) => (
          <div
            key={task.id}
            className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <button
              onClick={() => onToggle(task.id)}
              className="flex-shrink-0"
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  task.completed
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              >
                {task.completed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${task.completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
                {task.title}
              </p>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                task.owner === "agency"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {task.owner === "agency" ? "우리" : "클라이언트"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
