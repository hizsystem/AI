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
}

export interface BrandConfig {
  id: string;
  label: string;
  emoji: string;
  accent: string;
}

export interface FinanceConfig {
  monthlyBudget: number;
  invoiceDay: number;
  currency: "KRW";
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

  /** Token for client-specific access. If set, /clients/[slug] requires ?token=xxx */
  accessToken?: string;
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
