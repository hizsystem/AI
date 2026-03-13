# HUENIC Dashboard Design Spec

> **Date**: 2026-03-14
> **Status**: Draft
> **Author**: 우성민 (Green) + Claude
> **Client**: 휴닉(HUENIC) — 베지어트(VEGGIET) / 빈커(VINKER)

## 1. Overview

기존 `content-calendar` Next.js 앱에 `/huenic` 라우트를 추가하여, 휴닉팀과 공유하는 코칭용 대시보드를 구축한다. 베지어트(국내)와 빈커(해외) 두 브랜드를 헤더 드롭다운으로 전환하며, 캘린더 / 주간 리포트 / KPI 3개 탭으로 구성한다.

### 목적

- HIZ 코치팀이 휴닉 실무진(인국, 예랑)에게 주간 피드백을 제공하는 도구
- 휴닉팀이 스스로 콘텐츠 계획, 성과 확인, KPI 추적을 할 수 있는 자생력 도구
- 코치 모델 철학: 직접 제작이 아닌 프레임워크/피드백 제공

### 기술 스택

- **프레임워크**: Next.js 16 + React 19 + Tailwind 4 (기존 앱과 동일)
- **데이터 저장**: Vercel Blob Storage (JSON)
- **차트**: SVG 직접 구현 (외부 의존성 없음)
- **배포**: 기존 content-calendar Vercel 프로젝트에 포함

## 2. Data Model & Routing

### 2.1 타입 정의

타입은 `src/data/huenic-types.ts`에 별도 파일로 정의한다 (기존 `types.ts`는 tabshopbar 전용으로 유지).

```typescript
// src/data/huenic-types.ts

// 브랜드 타입
export type HuenicBrand = 'veggiet' | 'vinker';

// 휴닉 전용 콘텐츠 카테고리 — 기존 Category[] 타입에 맞춤
// (Category = { id: string; name: string; color: string; description?: string })
import type { Category } from './types';

export const HUENIC_CATEGORIES: Category[] = [
  { id: 'recipe', name: '레시피/제품', color: '#10b981' },
  { id: 'branding', name: '브랜딩', color: '#3b82f6' },
  { id: 'reels', name: '릴스', color: '#f97316' },
  { id: 'seeding', name: '시딩/콜라보', color: '#8b5cf6' },
];

export type HuenicContentCategory = 'recipe' | 'branding' | 'reels' | 'seeding';

// 캘린더 — 기존 CalendarData 구조를 따르되, huenic 카테고리 사용
// 기존 CalendarData 타입을 import하여 재사용 (items 내부 category 값만 다름)

// 주간 리포트
export interface WeeklyReport {
  brand: HuenicBrand;
  year: number;
  week: number;              // ISO week number
  period: string;            // "2026-03-10 ~ 2026-03-16"
  metrics: {
    followers: number;
    followersChange: number;  // vs 전주
    postsCount: number;
    engagementRate: number;
    erChange: number;         // vs 전주 (percentage point)
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
    thumbnailUrl?: string;    // 외부 URL (인스타그램 포스트 이미지), MVP에서는 생략 가능
  }[];
  coachComment: {
    author: string;           // "Green", "남중" 등
    wellDone: string;         // 잘한 점 1가지
    improvement: string;      // 개선할 점 1가지
    tryNext: string;          // 시도해볼 것 1가지
    createdAt: string;        // ISO date
  } | null;
  nextWeekPlan: string[];     // 다음 주 계획 항목
}

// KPI 데이터
export interface KpiData {
  brand: HuenicBrand;
  year: number;
  month: number;
  summary: {
    followers: { value: number; change: number; changePercent: number };
    monthlyPosts: { value: number; change: number; changePercent: number };
    avgER: { value: number; change: number };  // percentage point change
    monthlyReach: { value: number; change: number; changePercent: number };
  };
  followerTrend: {
    labels: string[];          // ["1월", "2월", ...]
    total: number[];
    organic: number[];
    paid: number[];
  };
  erTrend: {
    labels: string[];          // ["W1", "W2", ...]
    total: number[];
    feed: number[];
    reels: number[];
    story: number[];
  };
}

// KpiLineChart 공통 props
export interface LineChartProps {
  title: string;
  series: {
    label: string;
    data: number[];
    color: string;
  }[];
  labels: string[];            // X축 라벨
  unit?: string;               // "명", "%", "건" 등
  height?: number;             // 기본 240px
}
```

### 2.2 URL 구조

```
/huenic                           → 메인 (기본: brand=veggiet, tab=calendar)
/huenic?brand=veggiet&tab=calendar → 베지어트 캘린더
/huenic?brand=vinker&tab=report    → 빈커 주간 리포트
/huenic?brand=veggiet&tab=kpi      → 베지어트 KPI
```

### 2.3 Vercel Blob 저장 경로

기존 패턴(`calendar/{client}/{month}.json`)에 맞추되, huenic 전용 네임스페이스를 사용한다.

```
calendar/huenic-veggiet/2026-03.json    → 캘린더 (월별) — 기존 storage.ts 패턴 준수
calendar/huenic-vinker/2026-03.json     → 빈커 캘린더
huenic/veggiet/report-2026-W11.json     → 주간 리포트 (신규)
huenic/veggiet/kpi-2026-03.json         → KPI (신규, 월별)
huenic/vinker/report-2026-W11.json      → 빈커 주간 리포트
huenic/vinker/kpi-2026-03.json          → 빈커 KPI
```

- 캘린더 데이터는 기존 `storage.ts`의 `getCalendar()/saveCalendar()`를 client=`huenic-veggiet` 또는 `huenic-vinker`로 호출하여 재사용
- 리포트/KPI 데이터는 `src/lib/huenic-storage.ts`에 별도 read/write 함수 구현

### 2.4 로컬 개발 환경

`BLOB_READ_WRITE_TOKEN`이 없는 로컬 환경을 위해 시드 데이터를 제공한다.

```
src/data/huenic-seed/
├── veggiet-2026-03.json          → 캘린더 시드 (3월)
├── veggiet-report-2026-W11.json  → 주간 리포트 시드
├── veggiet-kpi-2026-03.json      → KPI 시드
├── vinker-2026-03.json           → 빈커 캘린더 시드
├── vinker-report-2026-W11.json   → 빈커 리포트 시드
└── vinker-kpi-2026-03.json       → 빈커 KPI 시드
```

`huenic-storage.ts`에서 Blob 실패 시 시드 데이터로 폴백한다 (기존 `storage.ts`의 `STATIC_DATA` 패턴과 동일).

## 3. UI Layout

### 3.1 전체 레이아웃

```
┌─────────────────────────────────────────────┐
│ 🌱 VEGGIET ▾    [📅 캘린더] [📊 리포트] [📈 KPI] │
├─────────────────────────────────────────────┤
│                                             │
│         선택된 탭의 콘텐츠                      │
│         (풀 너비, 스크롤)                      │
│                                             │
└─────────────────────────────────────────────┘
```

- 헤더 좌측: 브랜드 드롭다운 (🌱 VEGGIET / 🫘 VINKER)
- 헤더 우측: 3-탭 네비게이션
- 브랜드 전환 시 헤더 accent color 변경 (베지어트: 초록, 빈커: 보라)

### 3.2 캘린더 탭

**Calendar.tsx 일반화 필요**: 기존 `Calendar.tsx`는 `CONTENT_CATEGORIES`와 `STATUS_CONFIG`가 tabshopbar 전용으로 하드코딩되어 있다. 이를 해결하기 위해:

1. `Calendar.tsx` 내부의 하드코딩 `CONTENT_CATEGORIES` Set을 `data.categories`에서 동적 생성으로 변경
2. 브랜드 로고를 prop으로 주입 가능하게 변경 (`logo?: { src: string; alt: string }`)
3. `CalendarTab.tsx`에서 huenic 데이터를 주입할 때 `data.categories`에 `HUENIC_CATEGORIES`를 포함

상세 리팩토링 범위는 **Section 4.5** 참조.

**월 네비게이션**: 초기 available months는 `["2026-03"]`로 하드코딩하고, 월이 추가될 때마다 배열에 추가한다 (기존 tabshopbar 패턴과 동일).

콘텐츠 타입 색상:
- 레시피/제품: `#10b981` (초록)
- 브랜딩: `#3b82f6` (파랑)
- 릴스: `#f97316` (오렌지)
- 시딩/콜라보: `#8b5cf6` (보라)

### 3.3 주간 리포트 탭

- **주 네비게이션**: 기본값은 현재 ISO 주차. ← → 버튼으로 이전/다음 주 이동. ISO 주차 → 기간 문자열 변환은 유틸 함수로 구현.
- **상단 메트릭스 카드 4개**: 팔로워 / 게시물 수 / ER / 도달 (전주 대비 변동 포함)
- **이번 주 베스트 콘텐츠**: 제목 + 타입 뱃지 + 좋아요/댓글 수 (썸네일은 MVP에서 생략, 추후 URL로 추가 가능)
- **코치 코멘트**: 3-파트 구조화 입력 (잘한 점 / 개선할 점 / 시도해볼 것) — 각각 별도 텍스트 영역
- **다음 주 계획**: 체크리스트 형태

### 3.4 KPI 탭 (데이터라이즈 스타일)

**비주얼 톤**: Datarize 대시보드 레퍼런스 — 깔끔한 흰색 카드, 멀티라인 차트, 전기 대비 변동률

**기간 표시**: 우측 상단에 "2026년 3월 | 비교: 2026년 2월" 라벨을 표시한다. 실제 날짜 범위 선택 기능은 없음 — 월 단위 고정이며, 비교 대상은 자동으로 전월이다. (← → 버튼으로 월 이동)

**상단: 지표 요약 카드 (가로 배열)**
- 팔로워 × 월간 게시물 × 평균 ER = 월간 도달
- 각 카드: 큰 숫자 + ▲/▼ 변동률 (초록/빨강) + "vs 전월"
- 카드 간 연산자(×, =)로 지표 관계 시각화

**중단: 팔로워 추이 (멀티라인 차트)**
- 월별 X축, 좌측에 서브 지표 breakdown (전체/자연유입/광고)
- 라인 색상: 전체 `#10b981`, 자연유입 `#3b82f6`, 광고 `#f97316`

**하단: ER 추이 (멀티라인 차트)**
- 주별 X축, 좌측에 서브 지표 breakdown (전체/피드/릴스/스토리)
- 라인 색상: 전체 `#10b981`, 피드 `#3b82f6`, 릴스 `#f97316`, 스토리 `#8b5cf6`

**스타일 규칙:**

| 요소 | 스타일 |
|------|--------|
| 배경 | 흰색 카드 + 얇은 보더 `#e5e7eb` |
| 수치 증가 | 초록 `#16a34a` + ▲ |
| 수치 감소 | 빨강 `#dc2626` + ▼ |
| 숫자 | 큰 볼드 24-32px |
| 라벨 | 작은 회색 12-13px |
| 기간 표시 | 우측 상단, "2026년 3월 | 비교: 2026년 2월" |

## 4. Component Structure

### 4.1 페이지 & 컴포넌트 트리

```
src/app/huenic/
└── page.tsx                        # 메인 페이지

src/components/huenic/
├── HuenicDashboard.tsx             # 최상위 컨테이너 (brand + tab state)
├── BrandSwitcher.tsx               # 헤더 드롭다운
├── TabNavigation.tsx               # 3-탭 바
├── CalendarTab.tsx                  # Calendar 컴포넌트 래핑 + huenic 카테고리 주입
├── WeeklyReportTab.tsx             # 주간 리포트
│   ├── MetricsRow.tsx              # 4개 메트릭 카드
│   ├── TopContent.tsx              # 베스트 콘텐츠
│   ├── CoachComment.tsx            # 3-파트 구조화 코치 코멘트
│   └── NextWeekPlan.tsx            # 다음 주 계획
└── KpiTab.tsx                      # KPI 대시보드 (데이터라이즈 스타일)
    ├── KpiPeriodLabel.tsx          # 기간 라벨 + 월 이동 (날짜 선택 아님)
    ├── KpiSummaryCards.tsx         # 가로 배열 + 연산자 + 변동률
    ├── KpiLineChart.tsx            # 재사용 멀티라인 SVG 차트 (LineChartProps)
    └── KpiMetricBreakdown.tsx      # 차트 좌측 서브 지표
```

### 4.2 API 라우트

캘린더는 기존 API를 재사용하고, 리포트/KPI만 신규 라우트를 만든다.

```
# 캘린더 — 기존 라우트 재사용
src/app/api/calendar/[client]/[month]/route.ts    # client="huenic-veggiet" or "huenic-vinker"

# 리포트/KPI — 신규 라우트
src/app/api/huenic/[brand]/reports/[week]/route.ts  # GET/PUT 주간 리포트
src/app/api/huenic/[brand]/kpi/[month]/route.ts     # GET/PUT KPI (월별)
```

### 4.3 커스텀 훅

```typescript
// 캘린더 — 기존 useCalendarData 재사용
// CalendarTab에서 clientId를 `huenic-${brand}`로 전달
useCalendarData(clientId: string, month: string)

// 리포트/KPI — 신규 훅 (기존 패턴 따름)
useWeeklyReport(brand: HuenicBrand, year: number, week: number)
useKpiData(brand: HuenicBrand, year: number, month: number)
```

- `useWeeklyReport`는 기본값으로 현재 ISO 주차를 사용하며, setWeek으로 이전/다음 주 이동 가능
- `useKpiData`는 기본값으로 현재 월을 사용하며, setMonth으로 이전/다음 월 이동 가능

### 4.4 데이터 흐름

```
HuenicDashboard
  ├─ useSearchParams() → brand, tab 읽기
  ├─ BrandSwitcher → brand 변경 → URL 업데이트
  ├─ TabNavigation → tab 변경 → URL 업데이트
  └─ 선택된 탭 렌더링
       ├─ CalendarTab: useCalendarData(`huenic-${brand}`, month)
       ├─ WeeklyReportTab: useWeeklyReport(brand, year, week)
       └─ KpiTab: useKpiData(brand, year, month)
```

### 4.5 Calendar.tsx 리팩토링 범위

기존 `Calendar.tsx`에 최소한의 변경을 가한다:

**1. 카테고리 필터링 일반화**
- 기존: `CONTENT_CATEGORIES` 하드코딩 Set으로 `itemsByDate` 필터링
- 변경: `data.categories`의 id 목록에서 Set을 동적으로 생성
- `const validCategories = new Set(data.categories.map(c => c.id))`
- 기존 tabshopbar는 `data.categories`에 기존 카테고리가 들어있으므로 동작 동일

**2. 카테고리 표시 정보도 data.categories에서 읽기**
- 기존 `CONTENT_CATEGORIES` Map 대신 `data.categories`의 name/color 사용
- `const categoryMap = Object.fromEntries(data.categories.map(c => [c.id, c]))`

**3. 브랜드 로고 prop 추가**
- 기존: `<img src="/tsb-logo.png">` 하드코딩
- 변경: `CalendarProps`에 `logo?: { src: string; alt: string }` 추가
- 기본값: `{ src: '/tsb-logo.png', alt: 'TSB' }` (하위 호환)
- huenic에서는 `{ src: '/huenic-logo.png', alt: 'HUENIC' }` 주입

**4. CalendarData에 categories 포함**
- 기존 `CalendarData.categories: Category[]`가 이미 존재
- huenic 캘린더 데이터 저장 시 `HUENIC_CATEGORIES`를 `data.categories`에 포함시키면 됨

**하위 호환성**: 기존 tabshopbar 페이지는 변경 불필요. `data.categories`는 이미 tabshopbar 카테고리가 들어있고, logo prop은 기본값으로 기존 로고를 사용한다.

## 5. Error Handling

| 상황 | 처리 |
|------|------|
| 데이터 없음 (신규 월/주) | 빈 템플릿 자동 생성 + "아직 데이터가 없습니다" 안내 |
| API 실패 | 토스트 알림 + 마지막 캐시 데이터 표시 |
| 잘못된 브랜드 파라미터 | `veggiet`로 자동 폴백 |
| 저장 충돌 | Last Write Wins (1인 코칭팀이라 충분) |
| 로컬 Blob 미설정 | 시드 데이터로 자동 폴백 (개발 모드) |

## 6. Deployment

| 항목 | 방식 |
|------|------|
| 배포 | 기존 content-calendar Vercel 프로젝트에 포함 |
| URL | `content-calendar.vercel.app/huenic` |
| 인증 | 없음 (URL 기반 접근) |
| 데이터 | Vercel Blob Storage |

## 7. MVP Scope

### 포함 (Tier 1+2)

- 캘린더 탭 (Calendar.tsx 리팩토링 + huenic 카테고리 주입)
- 주간 리포트 탭 (지표 + 3-파트 코치 코멘트 + 주 네비게이션)
- KPI 탭 (데이터라이즈 스타일 멀티라인 차트 + 월 네비게이션)
- 브랜드 스위처 (VEGGIET ↔ VINKER)
- 수동 데이터 입력/편집
- 시드 데이터 (로컬 개발용)

### 미포함 (추후)

- Meta API 자동 연동
- 알림/리마인더
- 사용자 인증
- 콘텐츠 썸네일 이미지 업로드
