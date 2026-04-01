export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export type ContentStatus = "planning" | "needs-confirm" | "uploaded";

export interface ContentOverview {
  description?: string | null;
  format?: string | null;
  mentions?: string[] | null;
  hashtags?: string[] | null;
  images?: string[] | null;
  videoUrl?: string | null;
  localVideo?: string | null;
  caption?: string | null;
  captionAlts?: string[] | null;
  notes?: string | null;
  referenceUrls?: string[] | null;
}

export interface ContentItem {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  category: string;
  status?: ContentStatus;
  overview: ContentOverview;
}

export interface MoodboardItem {
  image: string;
  label?: string;
}

export interface CalendarData {
  client: string;
  clientSlug: string;
  month: string;
  title: string;
  description: string;
  coreMessage?: string;
  moodboard?: {
    description?: string;
    items: MoodboardItem[];
  };
  categories: Category[];
  items: ContentItem[];
}
