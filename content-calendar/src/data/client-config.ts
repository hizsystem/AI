import type { Category } from "./types";

// ─── Channel & Block Types ───

export type ChannelType = "instagram" | "naver-place" | "blog";

export type BlockId =
  // Instagram
  | "ig-calendar"
  | "ig-moodboard"
  | "ig-reference"
  | "ig-guide"
  | "ig-kpi"
  | "ig-report"
  // Naver Place
  | "np-audit"
  | "np-missions"
  | "np-keywords"
  // Blog
  | "blog-calendar"
  | "blog-seo"
  // Finance (cross-channel)
  | "finance";

export interface ChannelConfig {
  type: ChannelType;
  enabled: boolean;
  blocks: BlockId[];
  /** Instagram: calendar data key prefix (e.g. "huenic" → "huenic-veggiet") */
  calendarClientPrefix?: string;
  /** Naver Place: store identifier */
  storeId?: string;
  /** Default categories for calendar blocks */
  defaultCategories?: Category[];
  /** Default hashtags for new content (e.g. ["#브랜드라이즈", "#Brandrise"]) */
  defaultHashtags?: string[];
  /** Default mentions for new content (e.g. ["@brandrise_official"]) */
  defaultMentions?: string[];
}

export interface InstagramProfile {
  username: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  posts?: number;
  followers?: number;
  following?: number;
}

export interface BrandConfig {
  id: string;
  label: string;
  emoji: string;
  accent: string;
  instagram?: InstagramProfile;
}

export type FinanceModel = "retainer" | "monthly" | "expense-only" | "tbd";

export interface FinanceConfig {
  model: FinanceModel;
  currency: "KRW";
  // retainer: 연간 견적 기반 (휴닉)
  annualQuote?: number;
  monthlyBudget?: number;
  invoiceDay?: number;
  // monthly: 월 정산 선금/잔금 (위드런)
  monthlyFee?: number;
  advanceRate?: number; // 선금 비율 (0.5 = 50%)
  // recurring costs (체험단 등)
  recurringCosts?: { name: string; amount: number; frequency: string }[];
  // notes
  notes?: string;
}

export interface ProjectConfig {
  slug: string;
  name: string;
  emoji?: string;
  logo: { src: string; alt: string } | null;
  brandColor: string;
  status: "active" | "paused" | "completed";

  channels: ChannelConfig[];
  brands?: BrandConfig[];
  finance?: FinanceConfig;

  /** Token for client-specific access */
  accessToken?: string;
  /** Allow client view to edit (for brands managed by client team) */
  clientEditable?: boolean;
  /** Dashboard title override */
  dashboardTitle?: string;
}

// ─── Legacy compat (re-export as ClientConfig for existing code) ───

export type TabId = "calendar" | "moodboard" | "ref" | "guide" | "report" | "kpi";

/** @deprecated Use ProjectConfig instead */
export interface ClientConfig {
  slug: string;
  name: string;
  logo: { src: string; alt: string } | null;
  brandColor: string;
  tabs: TabId[];
  defaultCategories: Category[];
  defaultHashtags?: string[];
  defaultMentions?: string[];
  brands?: BrandConfig[];
  dashboardTitle?: string;
  calendarClientPrefix?: string;
  accessToken?: string;
}

// ─── Conversion helpers ───

/** Convert ProjectConfig to legacy ClientConfig for existing components */
export function toClientConfig(p: ProjectConfig): ClientConfig {
  const igChannel = p.channels.find((c) => c.type === "instagram");

  const tabMap: Record<string, TabId> = {
    "ig-calendar": "calendar",
    "ig-moodboard": "moodboard",
    "ig-reference": "ref",
    "ig-guide": "guide",
    "ig-kpi": "kpi",
    "ig-report": "report",
  };

  const tabs: TabId[] = igChannel
    ? igChannel.blocks
        .map((b) => tabMap[b])
        .filter((t): t is TabId => t !== undefined)
    : [];

  return {
    slug: p.slug,
    name: p.name,
    logo: p.logo,
    brandColor: p.brandColor,
    tabs: tabs.length > 0 ? tabs : ["calendar"],
    defaultCategories: igChannel?.defaultCategories || [],
    defaultHashtags: igChannel?.defaultHashtags,
    defaultMentions: igChannel?.defaultMentions,
    brands: p.brands,
    dashboardTitle: p.dashboardTitle,
    calendarClientPrefix: igChannel?.calendarClientPrefix,
    accessToken: p.accessToken,
  };
}

/** Check if project has a specific channel */
export function hasChannel(p: ProjectConfig, type: ChannelType): boolean {
  return p.channels.some((c) => c.type === type && c.enabled);
}

/** Get channel config */
export function getChannel(
  p: ProjectConfig,
  type: ChannelType
): ChannelConfig | undefined {
  return p.channels.find((c) => c.type === type && c.enabled);
}
