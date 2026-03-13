# HUENIC Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 content-calendar Next.js 앱에 `/huenic` 라우트를 추가하여 베지어트/빈커 브랜드 대시보드(캘린더, 주간 리포트, KPI) 구축

**Architecture:** 기존 Calendar 컴포넌트를 카테고리 일반화 후 래핑, 신규 리포트/KPI 탭을 추가. URL query 기반 brand/tab 상태 관리. Vercel Blob Storage로 데이터 저장.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Vercel Blob, SVG 차트 (외부 라이브러리 없음)

**Spec:** `docs/superpowers/specs/2026-03-14-huenic-dashboard-design.md`

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `src/data/huenic-types.ts` | HuenicBrand, WeeklyReport, KpiData, LineChartProps 타입 + HUENIC_CATEGORIES |
| `src/data/huenic-seed/veggiet-2026-03.json` | 베지어트 캘린더 시드 데이터 |
| `src/data/huenic-seed/veggiet-report-2026-W11.json` | 베지어트 주간 리포트 시드 |
| `src/data/huenic-seed/veggiet-kpi-2026-03.json` | 베지어트 KPI 시드 |
| `src/data/huenic-seed/vinker-2026-03.json` | 빈커 캘린더 시드 |
| `src/data/huenic-seed/vinker-report-2026-W11.json` | 빈커 주간 리포트 시드 |
| `src/data/huenic-seed/vinker-kpi-2026-03.json` | 빈커 KPI 시드 |
| `src/lib/huenic-storage.ts` | 리포트/KPI Blob read/write + 시드 폴백 |
| `src/app/api/huenic/[brand]/reports/[week]/route.ts` | 주간 리포트 GET/PUT API |
| `src/app/api/huenic/[brand]/kpi/[month]/route.ts` | KPI GET/PUT API |
| `src/hooks/useWeeklyReport.ts` | 주간 리포트 fetch/save 훅 |
| `src/hooks/useKpiData.ts` | KPI fetch/save 훅 |
| `src/app/huenic/page.tsx` | /huenic 페이지 엔트리포인트 |
| `src/components/huenic/HuenicDashboard.tsx` | 최상위 컨테이너 (brand + tab state) |
| `src/components/huenic/BrandSwitcher.tsx` | 헤더 브랜드 드롭다운 |
| `src/components/huenic/TabNavigation.tsx` | 3-탭 네비게이션 바 |
| `src/components/huenic/CalendarTab.tsx` | Calendar 래핑 + huenic 카테고리 주입 |
| `src/components/huenic/WeeklyReportTab.tsx` | 주간 리포트 탭 컨테이너 |
| `src/components/huenic/MetricsRow.tsx` | 4개 메트릭 카드 |
| `src/components/huenic/TopContent.tsx` | 베스트 콘텐츠 목록 |
| `src/components/huenic/CoachComment.tsx` | 3-파트 코치 코멘트 |
| `src/components/huenic/NextWeekPlan.tsx` | 다음 주 계획 체크리스트 |
| `src/components/huenic/KpiTab.tsx` | KPI 대시보드 컨테이너 |
| `src/components/huenic/KpiPeriodLabel.tsx` | 기간 라벨 + 월 이동 |
| `src/components/huenic/KpiSummaryCards.tsx` | 지표 요약 카드 가로 배열 |
| `src/components/huenic/KpiLineChart.tsx` | 재사용 멀티라인 SVG 차트 |
| `src/components/huenic/KpiMetricBreakdown.tsx` | 차트 좌측 서브 지표 |

### Modified files

| File | Change |
|------|--------|
| `src/components/Calendar.tsx` | CONTENT_CATEGORIES → data.categories 동적 생성, logo prop 추가 |
| `src/lib/storage.ts` | STATIC_DATA에 huenic 캘린더 시드 데이터 import 추가 |

---

## Chunk 1: Foundation (Types + Seed Data + Storage)

### Task 1: Type definitions

**Files:**
- Create: `content-calendar/src/data/huenic-types.ts`

- [ ] **Step 1: Create huenic-types.ts with all type definitions**

```typescript
// src/data/huenic-types.ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd content-calendar && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to huenic-types.ts

- [ ] **Step 3: Commit**

```bash
git add content-calendar/src/data/huenic-types.ts
git commit -m "feat(huenic): add type definitions for dashboard"
```

### Task 2: Seed data

**Files:**
- Create: `content-calendar/src/data/huenic-seed/veggiet-2026-03.json`
- Create: `content-calendar/src/data/huenic-seed/veggiet-report-2026-W11.json`
- Create: `content-calendar/src/data/huenic-seed/veggiet-kpi-2026-03.json`
- Create: `content-calendar/src/data/huenic-seed/vinker-2026-03.json`
- Create: `content-calendar/src/data/huenic-seed/vinker-report-2026-W11.json`
- Create: `content-calendar/src/data/huenic-seed/vinker-kpi-2026-03.json`

- [ ] **Step 1: Create veggiet calendar seed data**

Create `veggiet-2026-03.json` following CalendarData type with HUENIC_CATEGORIES. Include 6-8 sample content items across different categories (recipe, branding, reels, seeding) spread across March 2026.

- [ ] **Step 2: Create veggiet report seed data**

Create `veggiet-report-2026-W11.json` following WeeklyReport type. Include realistic Instagram metrics: ~12,000 followers, 4.2% ER, 3 top content items, a coach comment, and next week plans.

- [ ] **Step 3: Create veggiet KPI seed data**

Create `veggiet-kpi-2026-03.json` following KpiData type. Include 6-month follower trend (Oct 2025 ~ Mar 2026), 4-week ER trend, with realistic growth patterns.

- [ ] **Step 4: Create vinker seed data (3 files)**

Create equivalent vinker seed files with different metrics (smaller numbers — ~2,000 followers, lower ER, English-oriented content titles).

- [ ] **Step 5: Register huenic calendar seeds in storage.ts**

Modify `src/lib/storage.ts` to add huenic seed data to `STATIC_DATA`:

```typescript
// Add imports at top
import veggietMarch2026 from "@/data/huenic-seed/veggiet-2026-03.json";
import vinkerMarch2026 from "@/data/huenic-seed/vinker-2026-03.json";

// Add to STATIC_DATA object
const STATIC_DATA: Record<string, CalendarData> = {
  "tabshopbar:2026-03": march2026 as CalendarData,
  "huenic-veggiet:2026-03": veggietMarch2026 as CalendarData,
  "huenic-vinker:2026-03": vinkerMarch2026 as CalendarData,
};
```

This ensures `useCalendarData('huenic-veggiet', '2026-03')` returns seed data in local dev.

- [ ] **Step 6: Commit**

```bash
git add content-calendar/src/data/huenic-seed/ content-calendar/src/lib/storage.ts
git commit -m "feat(huenic): add seed data for local development"
```

### Task 3: Huenic storage module

**Files:**
- Create: `content-calendar/src/lib/huenic-storage.ts`

- [ ] **Step 1: Create huenic-storage.ts**

Follow the same pattern as `src/lib/storage.ts` — Blob first, static fallback. Functions:
- `getWeeklyReport(brand, year, week)` → `WeeklyReport | null`
- `saveWeeklyReport(brand, year, week, data)` → `void`
- `getKpiData(brand, year, month)` → `KpiData | null`
- `saveKpiData(brand, year, month, data)` → `void`

Blob paths: `huenic/{brand}/report-{year}-W{week}.json`, `huenic/{brand}/kpi-{year}-{month}.json`

Static fallback: dynamic import from `@/data/huenic-seed/` files.

- [ ] **Step 2: Commit**

```bash
git add content-calendar/src/lib/huenic-storage.ts
git commit -m "feat(huenic): add storage module with blob + seed fallback"
```

### Task 4: API routes

**Files:**
- Create: `content-calendar/src/app/api/huenic/[brand]/reports/[week]/route.ts`
- Create: `content-calendar/src/app/api/huenic/[brand]/kpi/[month]/route.ts`

- [ ] **Step 1: Create weekly report API route**

GET: calls `getWeeklyReport(brand, year, week)` — year is derived from week param format "2026-W11"
PUT: calls `saveWeeklyReport(brand, year, week, body)`

If brand is not 'veggiet' or 'vinker', auto-fallback to 'veggiet' (per spec Section 5).

- [ ] **Step 2: Create KPI API route**

GET: calls `getKpiData(brand, year, month)` — month param format "2026-03"
PUT: calls `saveKpiData(brand, year, month, body)`

Same brand auto-fallback to 'veggiet'.

- [ ] **Step 3: Verify routes compile**

Run: `cd content-calendar && npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add content-calendar/src/app/api/huenic/
git commit -m "feat(huenic): add API routes for reports and KPI"
```

### Task 5: Custom hooks

**Files:**
- Create: `content-calendar/src/hooks/useWeeklyReport.ts`
- Create: `content-calendar/src/hooks/useKpiData.ts`

- [ ] **Step 1: Create useWeeklyReport hook**

Follow `useCalendarData` pattern. State: data, loading, error. Default to current ISO week. Expose `setWeek` for navigation, `saveReport` for updates. ISO week utility: `getISOWeek(date)` and `getWeekPeriod(year, week)` → "2026-03-16 ~ 2026-03-22".

- [ ] **Step 2: Create useKpiData hook**

Same pattern. Default to current month. Expose `setMonth` for navigation, `saveKpi` for updates.

- [ ] **Step 3: Commit**

```bash
git add content-calendar/src/hooks/useWeeklyReport.ts content-calendar/src/hooks/useKpiData.ts
git commit -m "feat(huenic): add useWeeklyReport and useKpiData hooks"
```

---

## Chunk 2: Calendar.tsx Refactoring

### Task 6: Generalize Calendar.tsx

**Files:**
- Modify: `content-calendar/src/components/Calendar.tsx:27,55-66,95,257`

This is the most delicate task — we must preserve tabshopbar backward compatibility while making Calendar reusable.

- [ ] **Step 1: Replace hardcoded CONTENT_CATEGORIES Set with dynamic derivation**

In `Calendar.tsx`:

Change line 27 from:
```typescript
const CONTENT_CATEGORIES = new Set(["place", "pairing", "scene", "new-menu", "monthly-tap", "collab"]);
```
To: delete this line entirely.

Change line 63-66 `contentCategories` memo from:
```typescript
const contentCategories = useMemo(
  () => data.categories.filter((cat) => CONTENT_CATEGORIES.has(cat.id)),
  [data.categories]
);
```
To:
```typescript
const contentCategories = useMemo(
  () => data.categories,
  [data.categories]
);
```

Change line 92-101 `itemsByDate` memo from:
```typescript
const itemsByDate = useMemo(() => {
  const map: Record<number, ContentItem[]> = {};
  for (const item of data.items) {
    if (!CONTENT_CATEGORIES.has(item.category)) continue;
    ...
```
To:
```typescript
const itemsByDate = useMemo(() => {
  const validCategories = new Set(data.categories.map(c => c.id));
  const map: Record<number, ContentItem[]> = {};
  for (const item of data.items) {
    if (!validCategories.has(item.category)) continue;
    ...
```

- [ ] **Step 2: Add logo prop**

Add to `CalendarProps` interface (line 13):
```typescript
logo?: { src: string; alt: string };
```

Add to destructured props (line 35):
```typescript
logo = { src: '/tsb-logo.png', alt: 'TAP SHOP BAR' },
```

Change line 257 from:
```typescript
<img src="/tsb-logo.png" alt="TAP SHOP BAR" className="h-12 w-12 rounded-lg" />
```
To:
```typescript
<img src={logo.src} alt={logo.alt} className="h-12 w-12 rounded-lg" />
```

- [ ] **Step 3: Verify tabshopbar still works**

Run: `cd content-calendar && npm run build 2>&1 | tail -20`
Expected: Build succeeds. tabshopbar page should work identically (no props changed).

- [ ] **Step 4: Commit**

```bash
git add content-calendar/src/components/Calendar.tsx
git commit -m "refactor: generalize Calendar.tsx categories and logo for multi-client use"
```

---

## Chunk 3: UI Shell (Dashboard + Navigation)

### Task 7: Page entry point + HuenicDashboard

**Files:**
- Create: `content-calendar/src/app/huenic/page.tsx`
- Create: `content-calendar/src/components/huenic/HuenicDashboard.tsx`
- Create: `content-calendar/src/components/huenic/BrandSwitcher.tsx`
- Create: `content-calendar/src/components/huenic/TabNavigation.tsx`

- [ ] **Step 1: Create BrandSwitcher component**

Dropdown showing current brand (🌱 VEGGIET or 🫘 VINKER). On select, updates URL search param `brand`. Accent color changes: veggiet = green, vinker = purple.

- [ ] **Step 2: Create TabNavigation component**

3 tabs: 📅 캘린더, 📊 주간 리포트, 📈 KPI. Active tab from URL `tab` param. Clicking updates URL.

- [ ] **Step 3: Create HuenicDashboard component**

Reads `brand` and `tab` from `useSearchParams()`. Renders header (BrandSwitcher + TabNavigation) and conditionally renders CalendarTab / WeeklyReportTab / KpiTab based on tab value. For now, render placeholder divs for the 3 tabs.

- [ ] **Step 4: Create page.tsx**

```typescript
"use client";
import { Suspense } from "react";
import HuenicDashboard from "@/components/huenic/HuenicDashboard";

export default function HuenicPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>}>
      <HuenicDashboard />
    </Suspense>
  );
}
```

Note: `Suspense` wrapper required because `useSearchParams()` needs it in Next.js App Router.

- [ ] **Step 5: Verify the page renders**

Run: `cd content-calendar && npm run dev` → open `http://localhost:3000/huenic`
Expected: Header with brand switcher + 3 tabs visible. Tab switching works. Brand switching works. URL updates on interaction.

- [ ] **Step 6: Commit**

```bash
git add content-calendar/src/app/huenic/ content-calendar/src/components/huenic/HuenicDashboard.tsx content-calendar/src/components/huenic/BrandSwitcher.tsx content-calendar/src/components/huenic/TabNavigation.tsx
git commit -m "feat(huenic): add dashboard shell with brand switcher and tab navigation"
```

---

## Chunk 4: Calendar Tab

### Task 8: CalendarTab

**Files:**
- Create: `content-calendar/src/components/huenic/CalendarTab.tsx`

- [ ] **Step 1: Create CalendarTab component**

Props: `brand: HuenicBrand`. Uses `useCalendarData(`huenic-${brand}`, currentMonth)`. Wraps existing `Calendar` component with:
- `logo={{ src: '/huenic-logo.png', alt: 'HUENIC' }}` (or a text placeholder if no logo file)
- `allMonths={["2026-03"]}`
- Edit mode toggle + all CRUD callbacks from hook
- Loading/error states matching tabshopbar pattern

- [ ] **Step 2: Wire CalendarTab into HuenicDashboard**

Replace calendar tab placeholder with `<CalendarTab brand={brand} />`.

- [ ] **Step 3: Verify calendar renders with seed data**

Open `http://localhost:3000/huenic?tab=calendar`
Expected: Calendar grid shows with huenic categories (레시피/제품, 브랜딩, 릴스, 시딩/콜라보) and seed content items.

- [ ] **Step 4: Commit**

```bash
git add content-calendar/src/components/huenic/CalendarTab.tsx content-calendar/src/components/huenic/HuenicDashboard.tsx
git commit -m "feat(huenic): add calendar tab with existing Calendar component"
```

---

## Chunk 5: Weekly Report Tab

### Task 9: MetricsRow + TopContent components

**Files:**
- Create: `content-calendar/src/components/huenic/MetricsRow.tsx`
- Create: `content-calendar/src/components/huenic/TopContent.tsx`

- [ ] **Step 1: Create MetricsRow component**

4 horizontal cards: 팔로워, 게시물 수, ER, 도달. Each shows value + change (▲/▼ with green/red). Props: `metrics` from `WeeklyReport.metrics`.

- [ ] **Step 2: Create TopContent component**

List of top content items with type badge (피드/릴스/스토리) + likes + comments. Props: `items` from `WeeklyReport.topContent`.

- [ ] **Step 3: Commit**

```bash
git add content-calendar/src/components/huenic/MetricsRow.tsx content-calendar/src/components/huenic/TopContent.tsx
git commit -m "feat(huenic): add MetricsRow and TopContent components"
```

### Task 10: CoachComment + NextWeekPlan components

**Files:**
- Create: `content-calendar/src/components/huenic/CoachComment.tsx`
- Create: `content-calendar/src/components/huenic/NextWeekPlan.tsx`

- [ ] **Step 1: Create CoachComment component**

3-part structured input: 잘한 점 / 개선할 점 / 시도해볼 것. Read mode shows text. Edit mode shows textareas. Props: `comment` (WeeklyReport.coachComment), `onSave` callback.

- [ ] **Step 2: Create NextWeekPlan component**

Checklist of plan items. Edit mode allows add/remove/reorder. Props: `plans` (string[]), `onSave` callback.

- [ ] **Step 3: Commit**

```bash
git add content-calendar/src/components/huenic/CoachComment.tsx content-calendar/src/components/huenic/NextWeekPlan.tsx
git commit -m "feat(huenic): add CoachComment and NextWeekPlan components"
```

### Task 11: WeeklyReportTab assembly

**Files:**
- Create: `content-calendar/src/components/huenic/WeeklyReportTab.tsx`
- Modify: `content-calendar/src/components/huenic/HuenicDashboard.tsx`

- [ ] **Step 1: Create WeeklyReportTab component**

Props: `brand: HuenicBrand`. Uses `useWeeklyReport(brand, year, week)`. Renders:
1. Week navigation header (← W11 2026-03-10 ~ 2026-03-16 →)
2. MetricsRow
3. TopContent
4. CoachComment
5. NextWeekPlan

Loading/error/empty states included.

- [ ] **Step 2: Wire into HuenicDashboard**

Replace report tab placeholder with `<WeeklyReportTab brand={brand} />`.

- [ ] **Step 3: Verify report tab renders**

Open `http://localhost:3000/huenic?tab=report`
Expected: Metrics cards, top content, coach comment area, next week plan all visible with seed data.

- [ ] **Step 4: Commit**

```bash
git add content-calendar/src/components/huenic/WeeklyReportTab.tsx content-calendar/src/components/huenic/HuenicDashboard.tsx
git commit -m "feat(huenic): add weekly report tab with all sub-components"
```

---

## Chunk 6: KPI Tab (Datarize Style)

### Task 12: KpiLineChart (reusable SVG chart)

**Files:**
- Create: `content-calendar/src/components/huenic/KpiLineChart.tsx`

- [ ] **Step 1: Create KpiLineChart component**

Pure SVG multi-line chart. Props: `LineChartProps` (title, series[], labels[], unit?, height?).

Features:
- Y-axis auto-scaling from data min/max
- X-axis labels
- Color-coded lines with dots at data points
- Legend (top-right, color circles + labels)
- Responsive width (100% of container)
- Hover shows value tooltip (optional, can be MVP-skip)

No external chart library — build with `<svg>`, `<line>`, `<circle>`, `<text>`, `<polyline>`.

- [ ] **Step 2: Commit**

```bash
git add content-calendar/src/components/huenic/KpiLineChart.tsx
git commit -m "feat(huenic): add reusable SVG multi-line chart component"
```

### Task 13: KPI sub-components

**Files:**
- Create: `content-calendar/src/components/huenic/KpiPeriodLabel.tsx`
- Create: `content-calendar/src/components/huenic/KpiSummaryCards.tsx`
- Create: `content-calendar/src/components/huenic/KpiMetricBreakdown.tsx`

- [ ] **Step 1: Create KpiPeriodLabel component**

Shows "2026년 3월 | 비교: 2026년 2월" with ← → month navigation buttons.

- [ ] **Step 2: Create KpiSummaryCards component**

4 horizontal cards connected by operators (×, ×, =). Datarize style: big number + ▲/▼ change + "vs 전월". Cards: 팔로워, 월간 게시물, 평균 ER, 월간 도달.

Style: white card, thin border `#e5e7eb`, bold number 24-32px, small gray label 12-13px, green `#16a34a` for ▲, red `#dc2626` for ▼.

- [ ] **Step 3: Create KpiMetricBreakdown component**

Left-side breakdown for charts. Shows sub-metric values with change. Example: "전체 15,234 ▲2,340(18.1%)", "자연유입 11,200 ▲1,800".

- [ ] **Step 4: Commit**

```bash
git add content-calendar/src/components/huenic/KpiPeriodLabel.tsx content-calendar/src/components/huenic/KpiSummaryCards.tsx content-calendar/src/components/huenic/KpiMetricBreakdown.tsx
git commit -m "feat(huenic): add KPI sub-components (period, summary cards, breakdown)"
```

### Task 14: KpiTab assembly

**Files:**
- Create: `content-calendar/src/components/huenic/KpiTab.tsx`
- Modify: `content-calendar/src/components/huenic/HuenicDashboard.tsx`

- [ ] **Step 1: Create KpiTab component**

Props: `brand: HuenicBrand`. Uses `useKpiData(brand, year, month)`. Renders:
1. KpiPeriodLabel (with month navigation)
2. KpiSummaryCards (from data.summary)
3. Follower trend chart (KpiMetricBreakdown + KpiLineChart with 3 series: total/organic/paid)
4. ER trend chart (KpiMetricBreakdown + KpiLineChart with 4 series: total/feed/reels/story)

- [ ] **Step 2: Wire into HuenicDashboard**

Replace KPI tab placeholder with `<KpiTab brand={brand} />`.

- [ ] **Step 3: Verify KPI tab renders**

Open `http://localhost:3000/huenic?tab=kpi`
Expected: Datarize-style dashboard — summary cards with operators, line charts with legends, metric breakdowns.

- [ ] **Step 4: Commit**

```bash
git add content-calendar/src/components/huenic/KpiTab.tsx content-calendar/src/components/huenic/HuenicDashboard.tsx
git commit -m "feat(huenic): add KPI tab with Datarize-style charts"
```

---

## Chunk 7: Polish & Verification

### Task 15: Build verification + brand switching test

- [ ] **Step 1: Full build check**

Run: `cd content-calendar && npm run build 2>&1 | tail -30`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify all 3 tabs for both brands**

Manual check:
- `http://localhost:3000/huenic` → veggiet calendar loads
- `http://localhost:3000/huenic?brand=vinker` → vinker calendar loads
- `http://localhost:3000/huenic?tab=report` → report with seed data
- `http://localhost:3000/huenic?tab=kpi` → KPI with charts
- `http://localhost:3000/huenic?brand=vinker&tab=kpi` → vinker KPI
- `http://localhost:3000/tabshopbar` → still works (backward compat)

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(huenic): complete dashboard with calendar, report, and KPI tabs"
```
