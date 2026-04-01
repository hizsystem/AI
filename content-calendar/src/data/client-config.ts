import type { Category } from "./types";

export type TabId = "calendar" | "moodboard" | "ref" | "guide" | "report" | "kpi";

export interface BrandConfig {
  id: string;
  label: string;
  emoji: string;
  accent: string;
}

export interface ClientConfig {
  slug: string;
  name: string;
  logo: { src: string; alt: string } | null;
  brandColor: string;
  tabs: TabId[];
  defaultCategories: Category[];
  brands?: BrandConfig[];
  dashboardTitle?: string;
  /** How calendar data is keyed in Blob, e.g. "huenic" → "huenic-{brand}" */
  calendarClientPrefix?: string;
}
