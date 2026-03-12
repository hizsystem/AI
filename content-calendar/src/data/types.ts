export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export type ContentStatus = "planning" | "needs-confirm" | "uploaded";

export interface ContentOverview {
  description?: string;
  format?: string;
  mentions?: string[];
  hashtags?: string[];
  images?: string[];
  videoUrl?: string;
  localVideo?: string;
  caption?: string;
  captionAlts?: string[];
  notes?: string;
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
