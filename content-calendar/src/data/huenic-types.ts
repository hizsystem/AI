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
