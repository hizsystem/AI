"use client";

import type { NpMissionsData } from "@/data/np-types";

interface WeeklyMissionsProps {
  missions: NpMissionsData | null;
}

const WEEK_LABELS = ["", "Week 1 — 세팅", "Week 2 — 콘텐츠", "Week 3 — 확장", "Week 4 — 루틴화"];

export default function WeeklyMissions({ missions }: WeeklyMissionsProps) {
  if (!missions || missions.missions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
        진단 후 주간 미션이 자동 생성됩니다
      </div>
    );
  }

  const byWeek = [1, 2, 3, 4].map((w) =>
    missions.missions.filter((m) => m.week === w)
  );

  const totalMissions = missions.missions.length;
  const completedMissions = missions.missions.filter((m) => m.completed).length;
  const pct = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">전체 진행률</span>
          <span className="text-sm font-bold text-gray-900">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          {completedMissions} / {totalMissions} 완료
        </p>
      </div>

      {/* Weeks */}
      {byWeek.map((weekMissions, i) => {
        if (weekMissions.length === 0) return null;
        const week = i + 1;
        const weekComplete = weekMissions.filter((m) => m.completed).length;

        return (
          <div key={week} className="bg-white rounded-xl border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                {WEEK_LABELS[week]}
              </span>
              <span className="text-[10px] text-gray-400">
                {weekComplete}/{weekMissions.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {weekMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="px-4 py-2.5 flex items-center gap-3"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      mission.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {mission.completed && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${mission.completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
                      {mission.task}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 flex-shrink-0">
                    {mission.source}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                      mission.owner === "us"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {mission.owner === "us" ? "우리" : "사장님"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
