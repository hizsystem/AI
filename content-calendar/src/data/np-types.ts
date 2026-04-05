export type NpGrade = "S" | "A" | "B" | "C" | "D";
export type NpItemStatus = "good" | "needs-improve" | "urgent";
export type NpCategory = "S" | "A" | "B" | "X";

export interface NpAuditItem {
  id: string; // "S1", "A2", "B3", etc
  category: NpCategory;
  name: string;
  maxScore: number;
  score: number;
  status: NpItemStatus;
}

export interface NpAuditData {
  storeId: string;
  storeName: string;
  auditDate: string;
  totalScore: number;
  grade: NpGrade;
  items: NpAuditItem[];
}

export interface NpMission {
  id: string;
  week: 1 | 2 | 3 | 4;
  task: string;
  owner: "us" | "client";
  source: string; // "S1", "A2" etc
  completed: boolean;
}

export interface NpMissionsData {
  storeId: string;
  storeName: string;
  startDate: string;
  missions: NpMission[];
}

// Default audit template
export const NP_AUDIT_TEMPLATE: Omit<NpAuditItem, "score" | "status">[] = [
  { id: "S1", category: "S", name: "리뷰", maxScore: 20 },
  { id: "S2", category: "S", name: "플레이스 광고", maxScore: 15 },
  { id: "S3", category: "S", name: "솔루션(예약/쿠폰/톡톡)", maxScore: 15 },
  { id: "A1", category: "A", name: "사진 & 영상", maxScore: 8 },
  { id: "A2", category: "A", name: "대표 키워드", maxScore: 8 },
  { id: "A3", category: "A", name: "소식 & 이벤트", maxScore: 7 },
  { id: "A4", category: "A", name: "블로그 체험단", maxScore: 7 },
  { id: "B1", category: "B", name: "기본정보", maxScore: 6 },
  { id: "B2", category: "B", name: "소개문", maxScore: 5 },
  { id: "B3", category: "B", name: "AI브리핑 & 매장명", maxScore: 4 },
  { id: "X1", category: "X", name: "외부채널", maxScore: 3 },
  { id: "X2", category: "X", name: "커넥트", maxScore: 2 },
];

export const NP_CATEGORY_CONFIG: Record<NpCategory, { label: string; maxScore: number; color: string }> = {
  S: { label: "S등급 (매출 직결)", maxScore: 50, color: "#ef4444" },
  A: { label: "A등급 (노출 순위)", maxScore: 30, color: "#f59e0b" },
  B: { label: "B등급 (기본기)", maxScore: 15, color: "#3b82f6" },
  X: { label: "X등급 (확장)", maxScore: 5, color: "#8b5cf6" },
};
