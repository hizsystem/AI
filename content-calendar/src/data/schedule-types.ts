export type ScheduleType = "meeting" | "campaign" | "milestone" | "deadline" | "other";

export interface ScheduleItem {
  id: string;
  date: string;
  title: string;
  type: ScheduleType;
  description?: string;
  completed: boolean;
}

export interface ScheduleData {
  clientSlug: string;
  items: ScheduleItem[];
}

export const SCHEDULE_TYPE_CONFIG: Record<ScheduleType, { label: string; emoji: string; color: string }> = {
  meeting: { label: "미팅", emoji: "📅", color: "#6366f1" },
  campaign: { label: "체험단/캠페인", emoji: "📣", color: "#f59e0b" },
  milestone: { label: "마일스톤", emoji: "🎯", color: "#10b981" },
  deadline: { label: "마감", emoji: "⏰", color: "#ef4444" },
  other: { label: "기타", emoji: "📌", color: "#6b7280" },
};
