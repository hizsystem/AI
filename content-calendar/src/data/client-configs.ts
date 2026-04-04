import type { ProjectConfig } from "./client-config";

export const DEFAULT_PROJECT_CONFIGS: ProjectConfig[] = [
  // ─── 휴닉 (HUENIC) ───
  {
    slug: "huenic",
    name: "HUENIC",
    logo: null,
    brandColor: "#10b981",
    status: "active",
    brands: [
      { id: "veggiet", label: "VEGGIET", emoji: "\uD83C\uDF31", accent: "bg-emerald-500" },
      { id: "vinker", label: "VINKER", emoji: "\uD83E\uDED8", accent: "bg-purple-500" },
    ],
    dashboardTitle: "HUENIC DASHBOARD",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar", "ig-moodboard", "ig-reference", "ig-guide", "ig-report", "ig-kpi"],
        calendarClientPrefix: "huenic",
        defaultCategories: [
          { id: "recipe", name: "레시피/제품", color: "#10b981" },
          { id: "branding", name: "브랜딩", color: "#3b82f6" },
          { id: "reels", name: "릴스", color: "#f97316" },
          { id: "seeding", name: "시딩/콜라보", color: "#8b5cf6" },
        ],
      },
      {
        type: "blog",
        enabled: true,
        blocks: ["blog-calendar"],
      },
    ],
    finance: { monthlyBudget: 8900000, invoiceDay: 10, currency: "KRW" },
  },

  // ─── 위드런 - 미레국밥 ───
  {
    slug: "mirye-gukbap",
    name: "미레국밥",
    logo: null,
    brandColor: "#d97706",
    status: "active",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar", "ig-moodboard", "ig-reference"],
        defaultCategories: [
          { id: "menu", name: "메뉴/음식", color: "#d97706" },
          { id: "story", name: "스토리/일상", color: "#6366f1" },
          { id: "promo", name: "프로모션", color: "#ef4444" },
          { id: "review", name: "리뷰/후기", color: "#10b981" },
        ],
      },
      {
        type: "naver-place",
        enabled: true,
        blocks: ["np-audit", "np-missions", "np-keywords"],
        storeId: "mirye-gukbap",
      },
    ],
    finance: { monthlyBudget: 1500000, invoiceDay: 10, currency: "KRW" },
  },

  // ─── 위드런 - 댄싱컵 ───
  {
    slug: "dancingcup",
    name: "댄싱컵",
    logo: null,
    brandColor: "#ec4899",
    status: "active",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar", "ig-moodboard", "ig-reference"],
        defaultCategories: [
          { id: "menu", name: "메뉴/음료", color: "#ec4899" },
          { id: "mood", name: "무드/공간", color: "#8b5cf6" },
          { id: "promo", name: "프로모션", color: "#f97316" },
          { id: "daily", name: "일상/비하인드", color: "#6366f1" },
        ],
      },
      {
        type: "naver-place",
        enabled: true,
        blocks: ["np-audit", "np-missions", "np-keywords"],
        storeId: "dancingcup",
      },
    ],
    finance: { monthlyBudget: 1500000, invoiceDay: 10, currency: "KRW" },
  },

  // ─── 고벤처포럼 ───
  {
    slug: "goventure",
    name: "고벤처포럼",
    logo: null,
    brandColor: "#1e40af",
    status: "active",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar", "ig-moodboard"],
        defaultCategories: [
          { id: "event", name: "포럼/이벤트", color: "#1e40af" },
          { id: "content", name: "콘텐츠", color: "#6366f1" },
          { id: "news", name: "뉴스/소식", color: "#0891b2" },
        ],
      },
      {
        type: "blog",
        enabled: true,
        blocks: ["blog-calendar"],
      },
    ],
    finance: { monthlyBudget: 3000000, invoiceDay: 10, currency: "KRW" },
  },

  // ─── 브랜드라이즈 ───
  {
    slug: "brandrise",
    name: "브랜드라이즈",
    logo: null,
    brandColor: "#111827",
    status: "active",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar", "ig-moodboard"],
        defaultCategories: [
          { id: "insight", name: "인사이트", color: "#111827" },
          { id: "case", name: "케이스스터디", color: "#6366f1" },
          { id: "brand", name: "브랜드/소식", color: "#0891b2" },
        ],
      },
      {
        type: "blog",
        enabled: true,
        blocks: ["blog-calendar"],
      },
    ],
  },

  // ─── HD현대오일뱅크 ───
  {
    slug: "hdoilbank",
    name: "HD현대오일뱅크",
    logo: null,
    brandColor: "#dc2626",
    status: "active",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar"],
        defaultCategories: [
          { id: "campaign", name: "캠페인", color: "#dc2626" },
          { id: "content", name: "콘텐츠", color: "#f97316" },
          { id: "event", name: "이벤트", color: "#eab308" },
        ],
      },
    ],
    finance: { monthlyBudget: 5000000, invoiceDay: 25, currency: "KRW" },
  },

  // ─── 탭샵바 (PAUSED) ───
  {
    slug: "tabshopbar",
    name: "탭샵바 (TAP SHOP BAR)",
    logo: { src: "/tsb-logo.png", alt: "TAP SHOP BAR" },
    brandColor: "#4A7BF7",
    status: "paused",
    channels: [
      {
        type: "instagram",
        enabled: true,
        blocks: ["ig-calendar"],
        defaultCategories: [
          { id: "place", name: "#탭샵바플레이스", color: "#4A7BF7", description: "지점·공간 소개" },
          { id: "pairing", name: "#탭샵바페어링", color: "#E8A838", description: "와인과 음식 페어링" },
          { id: "scene", name: "#탭샵바씬", color: "#45B26B", description: "촬영·대관·브랜드 활동" },
          { id: "new-menu", name: "#탭샵바뉴", color: "#9B59B6", description: "신메뉴 출시 소개" },
          { id: "monthly-tap", name: "#이달의탭", color: "#E05555", description: "이달의 프로모션 와인" },
          { id: "guide", name: "#탭샵바가이드", color: "#14B8A6", description: "초보자 가이드 시리즈" },
        ],
      },
    ],
  },
];

// ─── Legacy compat ───
import { toClientConfig, type ClientConfig } from "./client-config";

/** @deprecated Use DEFAULT_PROJECT_CONFIGS instead */
export const DEFAULT_CLIENT_CONFIGS: ClientConfig[] =
  DEFAULT_PROJECT_CONFIGS.map(toClientConfig);
