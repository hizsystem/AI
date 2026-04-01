import type { ClientConfig } from "./client-config";

export const DEFAULT_CLIENT_CONFIGS: ClientConfig[] = [
  {
    slug: "tabshopbar",
    name: "탭샵바 (TAP SHOP BAR)",
    logo: { src: "/tsb-logo.png", alt: "TAP SHOP BAR" },
    brandColor: "#4A7BF7",
    tabs: ["calendar"],
    defaultCategories: [
      { id: "place", name: "#탭샵바플레이스", color: "#4A7BF7", description: "지점·공간 소개" },
      { id: "pairing", name: "#탭샵바페어링", color: "#E8A838", description: "와인과 음식 페어링" },
      { id: "scene", name: "#탭샵바씬", color: "#45B26B", description: "촬영·대관·브랜드 활동" },
      { id: "new-menu", name: "#탭샵바뉴", color: "#9B59B6", description: "신메뉴 출시 소개" },
      { id: "monthly-tap", name: "#이달의탭", color: "#E05555", description: "이달의 프로모션 와인" },
      { id: "guide", name: "#탭샵바가이드", color: "#14B8A6", description: "초보자 가이드 시리즈" },
    ],
  },
  {
    slug: "huenic",
    name: "HUENIC",
    logo: null,
    brandColor: "#10b981",
    tabs: ["calendar", "moodboard", "ref", "guide", "report", "kpi"],
    defaultCategories: [
      { id: "recipe", name: "레시피/제품", color: "#10b981" },
      { id: "branding", name: "브랜딩", color: "#3b82f6" },
      { id: "reels", name: "릴스", color: "#f97316" },
      { id: "seeding", name: "시딩/콜라보", color: "#8b5cf6" },
    ],
    brands: [
      { id: "veggiet", label: "VEGGIET", emoji: "\uD83C\uDF31", accent: "bg-emerald-500" },
      { id: "vinker", label: "VINKER", emoji: "\uD83E\uDED8", accent: "bg-purple-500" },
    ],
    dashboardTitle: "HUENIC DASHBOARD",
    calendarClientPrefix: "huenic",
  },
];
