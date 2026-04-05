import type { Category } from './types';

export type HuenicBrand = 'veggiet' | 'vinker';

export const HUENIC_CATEGORIES: Category[] = [
  { id: 'recipe', name: '레시피/제품', color: '#10b981' },
  { id: 'branding', name: '브랜딩', color: '#3b82f6' },
  { id: 'reels', name: '릴스', color: '#f97316' },
  { id: 'seeding', name: '시딩/콜라보', color: '#8b5cf6' },
];

export type HuenicContentCategory = 'recipe' | 'branding' | 'reels' | 'seeding';

export interface WeeklyReport {
  brand: HuenicBrand;
  year: number;
  week: number;
  period: string;
  metrics: {
    followers: number;
    followersChange: number;
    postsCount: number;
    engagementRate: number;
    erChange: number;
    topLikes: number;
    reach: number;
    reachChange: number;
  };
  topContent: {
    id: string;
    title: string;
    type: 'feed' | 'reels' | 'story';
    likes: number;
    comments: number;
    thumbnailUrl?: string;
  }[];
  coachComment: {
    author: string;
    wellDone: string;
    improvement: string;
    tryNext: string;
    createdAt: string;
  } | null;
  nextWeekPlan: string[];
}

export interface KpiData {
  brand: HuenicBrand;
  year: number;
  month: number;
  summary: {
    followers: { value: number; change: number; changePercent: number };
    monthlyPosts: { value: number; change: number; changePercent: number };
    avgER: { value: number; change: number };
    monthlyReach: { value: number; change: number; changePercent: number };
  };
  followerTrend: {
    labels: string[];
    total: number[];
    organic: number[];
    paid: number[];
  };
  erTrend: {
    labels: string[];
    total: number[];
    feed: number[];
    reels: number[];
    story: number[];
  };
}

// --- Reference Collections ---

export const VEGGIET_REF_COLLECTIONS: RefCollection[] = [
  { id: 'vegieter', name: '이달의 베지어터', color: '#10b981' },
  { id: 'lab', name: '베지어트 랩', color: '#3b82f6' },
  { id: 'attack', name: '베지어택', color: '#f59e0b' },
  { id: 'lets', name: "Let's Veggiet", color: '#e11d48' },
  { id: 'my', name: 'MY VEGGIET', color: '#f97316' },
  { id: 'moment', name: '베지어트 모먼트', color: '#8b5cf6' },
  { id: 'interview', name: '베지터뷰', color: '#ec4899' },
  { id: 'event', name: '이벤트/프로모션', color: '#ef4444' },
  { id: 'general', name: '기타', color: '#6b7280' },
];

export const VINKER_REF_COLLECTIONS: RefCollection[] = [
  { id: 'retail', name: 'Retail & Demo', color: '#10b981' },
  { id: 'collab', name: 'Collab & Giveaway', color: '#3b82f6' },
  { id: 'content', name: 'Content', color: '#f97316' },
  { id: 'general', name: 'General', color: '#6b7280' },
];

export interface RefCollection {
  id: string;
  name: string;
  color: string;
}

export interface RefItem {
  id: string;
  collectionId: string;
  url: string;
  thumbnailUrl?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'web' | 'other';
  comment?: string;
  addedBy?: string;
  createdAt: string;
}

export interface RefData {
  brand: HuenicBrand;
  collections: RefCollection[];
  items: RefItem[];
}

export interface LineChartProps {
  title: string;
  series: {
    label: string;
    data: number[];
    color: string;
  }[];
  labels: string[];
  unit?: string;
  height?: number;
}
