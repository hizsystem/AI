import type { ChannelConfig } from "./client-config";

export interface ServicePackage {
  id: string;
  name: string;
  emoji: string;
  description: string;
  priceRange: string;
  channels: ChannelConfig[];
  features: string[];
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "coaching",
    name: "코칭형",
    emoji: "🎯",
    description: "네이버플레이스 진단 + 주간 코칭으로 매장 노출 개선",
    priceRange: "월 50~100만",
    channels: [
      {
        type: "naver-place",
        enabled: true,
        blocks: ["np-audit", "np-missions", "np-keywords"],
      },
    ],
    features: [
      "100점 진단 리포트",
      "4주 코칭 미션",
      "키워드 전략",
      "주간 미팅",
    ],
  },
  {
    id: "operation",
    name: "운영형",
    emoji: "📱",
    description: "인스타그램 기획/운영 + 네이버플레이스 관리",
    priceRange: "월 150~300만",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar", "ig-moodboard", "ig-reference"],
      },
      {
        type: "naver-place",
        enabled: true,
        blocks: ["np-audit", "np-missions"],
      },
    ],
    features: [
      "월 콘텐츠 캘린더 기획",
      "피드 프리뷰 시뮬레이션",
      "레퍼런스 관리",
      "NP 진단 + 미션",
      "일정 관리",
    ],
  },
  {
    id: "full",
    name: "풀매니지먼트",
    emoji: "🚀",
    description: "브랜드 전체 채널 통합 관리 + KPI + 리포팅",
    priceRange: "월 500만+",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar", "ig-moodboard", "ig-reference", "ig-guide", "ig-kpi", "ig-report"],
      },
      {
        type: "naver-place",
        enabled: true,
        blocks: ["np-audit", "np-missions", "np-keywords"],
      },
      {
        type: "blog",
        enabled: true,
        blocks: ["blog-calendar"],
      },
    ],
    features: [
      "전 채널 콘텐츠 기획/운영",
      "KPI 트래킹 + 주간 리포트",
      "피드 프리뷰 + 무드보드",
      "NP 풀 코칭",
      "블로그 콘텐츠",
      "월간 브랜딩 미팅",
    ],
  },
];
