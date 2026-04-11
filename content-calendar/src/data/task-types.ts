export type TaskStatus = "pending" | "in-progress" | "done";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface TaskItem {
  id: string;
  projectSlug: string;
  category?: string;  // e.g. "네이버플레이스", "인플루언서", "체험단"
  title: string;
  assigneeId: string;
  status: TaskStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  createdAt: string;
}

export interface TaskBoard {
  tasks: TaskItem[];
  members: TeamMember[];
  updatedAt: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "대기",
  "in-progress": "진행중",
  done: "완료",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, { dot: string; text: string; bg: string }> = {
  pending: { dot: "bg-gray-300", text: "text-gray-500", bg: "bg-gray-100" },
  "in-progress": { dot: "bg-blue-400", text: "text-blue-600", bg: "bg-blue-50" },
  done: { dot: "bg-emerald-400", text: "text-emerald-600", bg: "bg-emerald-50" },
};

// Default team members (HIZ + HUENIC)
export const DEFAULT_MEMBERS: TeamMember[] = [
  { id: "green", name: "우성민", role: "Lead PM", color: "#10b981" },
  { id: "namjung", name: "김남중", role: "PM", color: "#3b82f6" },
  { id: "sumin", name: "이수민", role: "Designer", color: "#8b5cf6" },
  { id: "inguk", name: "인국", role: "콘텐츠", color: "#f97316" },
  { id: "yerang", name: "예랑", role: "브랜드 매니저", color: "#ec4899" },
  { id: "jina", name: "박진아", role: "대표", color: "#ef4444" },
];
