# Brand Dashboard v2 — Architecture Plan

> 브랜드 프로젝트 운영 컨트롤 타워
> 데드라인: 2026-04-10 (금)

---

## 1. 핵심 변화

| 항목 | AS-IS (v1) | TO-BE (v2) |
|------|------------|------------|
| 정체성 | 콘텐츠 캘린더 | 브랜드 프로젝트 운영 대시보드 |
| 채널 | Instagram만 | Instagram + Naver Place + (Blog) |
| 사용자 | Admin 1명 | Admin + 팀원(편집) + 클라이언트(읽기) |
| 구조 | 클라이언트별 단일 뷰 | 클라이언트 > 채널 > 블록 |
| 재무 | 없음 | 예산/지출/세금계산서 카드 |

---

## 2. 대상 브랜드 & 채널 매핑

| 브랜드 | Instagram | Naver Place | Blog | 재무 |
|--------|:---------:|:-----------:|:----:|:----:|
| 휴닉 (베지어트/빙커) | O | - | O | O |
| 위드런 - 미례국밥 | O | O | - | O |
| 위드런 - 댄싱컵 | O | O | - | O |
| 고벤처포럼 | O | - | O | O |
| 브랜드라이즈 | O | - | O | O |
| HD현대오일뱅크 | O | - | - | O |

---

## 3. 채널별 블록 설계

### 3-1. Instagram 블록

| 블록 | 설명 | v1 상태 | v2 변경 |
|------|------|---------|---------|
| **캘린더** | 월간 콘텐츠 스케줄 | 있음 (풀 모달) | 사이드패널 편집 + 셀 썸네일 표시 |
| **무드보드** | 피드 비주얼 프리뷰 | 있음 (카드) | 3열 인스타 그리드 시뮬레이터 |
| **레퍼런스** | 영감/참고 자료 | 있음 (텍스트만) | 썸네일 카드 그리드 (Pinterest) |
| **가이드** | 브랜드 가이드 | 있음 | 유지 |
| **KPI** | 성과 지표 | 있음 (시트 연동) | 유지 + 연동 안정화 |
| **주간 리포트** | 주간 현황 | 있음 | 유지 |

**캘린더 UX 개선 (Planable/Later 참고):**
- 날짜 셀 클릭 → 우측 사이드패널 슬라이드 (캘린더 가리지 않음)
- 캘린더 셀에 이미지 썸네일 + 컬러 카테고리 바 직접 표시
- 퀵 추가: 날짜 셀의 + 버튼 → 제목만 입력 → 상세는 나중에
- 드래그앤드롭으로 날짜 이동

**무드보드 UX 개선 (Planoly 참고):**
- 3열 그리드로 실제 인스타 피드 시뮬레이션
- 예정 콘텐츠가 기존 발행물과 이어져서 표시
- 드래그로 순서 재배치 가능

**레퍼런스 UX 개선:**
- URL에서 OG 이미지 자동 추출 → 썸네일 카드
- 카테고리별 필터 유지
- 카드 클릭 시 라이트박스 프리뷰

### 3-2. Naver Place 블록

| 블록 | 설명 | 데이터 소스 |
|------|------|-------------|
| **진단 점수** | 100점 채점 현황 (S/A/B/X) | np-audit 결과 or 수동 입력 |
| **주간 미션** | 이번 주 할 일 체크리스트 | Blob 저장 |
| **키워드** | 대표 키워드 순위 추적 | 수동 입력 (향후 자동화) |

**진단 점수 UI:**
- S등급(50) / A등급(30) / B등급(15) / X등급(5) 막대 차트
- 각 항목별 점수 + 판정(양호/개선필요/즉시개선) 표시
- 총점 + 등급(S/A/B/C/D)

**주간 미션 UI:**
- 4주 코칭 타임라인 (Week 1~4)
- 각 미션: 체크박스 + task + owner(우리/사장님) + source(S1~X2)
- 완료율 프로그레스 바

### 3-3. Blog 블록 (설계만, 구현 후순위)

| 블록 | 설명 |
|------|------|
| **콘텐츠 캘린더** | Instagram 캘린더 컴포넌트 재활용, 카테고리만 변경 |
| **SEO 체크리스트** | 포스트별 SEO 항목 체크 |

### 3-4. Finance 블록 (전체 공통)

| 블록 | 설명 |
|------|------|
| **월 예산** | 클라이언트별 월 계약 금액 표시 |
| **세금계산서** | 발행 예정일 + 발행 완료 여부 |
| **지출 현황** | 광고비, 외주비 등 카테고리별 지출 |

데이터: 수동 입력 (Blob 저장). 구글시트 연동은 향후 Phase.

---

## 4. 사용자 & 권한 모델

| 역할 | 접근 방식 | 권한 |
|------|----------|------|
| **Admin** | /admin 비밀번호 로그인 | 전체 CRUD + 클라이언트/채널 설정 |
| **Team** | /admin 비밀번호 로그인 (동일) | 콘텐츠 등록/수정 + 읽기. 클라이언트 추가/삭제 불가 |
| **Client** | /clients/[slug]?token=xxx | 자기 브랜드 읽기 전용 |

v2에서는 Admin/Team 구분 없이 같은 비밀번호로 로그인.
Team 권한 분리는 Phase 2에서 (팀원별 계정이 필요해지면).

---

## 5. 데이터 모델 변경

### ProjectConfig (ClientConfig 확장)

```typescript
interface ProjectConfig {
  // 기존
  slug: string;
  name: string;
  logo: { src: string; alt: string } | null;
  brandColor: string;
  accessToken?: string;

  // v2 추가
  channels: ChannelConfig[];
  brands?: BrandConfig[];         // 서브 브랜드 (휴닉의 베지어트/빙커)
  finance?: FinanceConfig;
  status: "active" | "paused";    // 탭샵바 = paused
}

interface ChannelConfig {
  type: "instagram" | "naver-place" | "blog";
  enabled: boolean;
  blocks: BlockId[];              // 활성 블록
  // 채널별 추가 설정
  calendarClientPrefix?: string;  // instagram용
  storeId?: string;               // naver-place용
}

type BlockId =
  // Instagram
  | "ig-calendar" | "ig-moodboard" | "ig-reference" | "ig-guide" | "ig-kpi" | "ig-report"
  // Naver Place
  | "np-audit" | "np-missions" | "np-keywords"
  // Blog
  | "blog-calendar" | "blog-seo"
  // Finance
  | "finance";

interface FinanceConfig {
  monthlyBudget: number;
  invoiceDay: number;             // 세금계산서 발행일
  currency: "KRW";
}
```

### NP 데이터 모델

```typescript
interface NpAuditData {
  storeId: string;
  storeName: string;
  auditDate: string;
  totalScore: number;
  grade: "S" | "A" | "B" | "C" | "D";
  items: NpAuditItem[];
}

interface NpAuditItem {
  id: string;                     // "S1", "A2", "B3" 등
  category: "S" | "A" | "B" | "X";
  name: string;
  maxScore: number;
  score: number;
  status: "good" | "needs-improve" | "urgent";
}

interface NpMission {
  id: string;
  week: 1 | 2 | 3 | 4;
  task: string;
  owner: "us" | "client";
  source: string;                 // "S1", "A2" 등 진단 항목
  completed: boolean;
}
```

---

## 6. 페이지 구조

```
/admin
├── [사이드바]
│   ├── 전체 Overview
│   ├── ── Clients ──
│   ├── 휴닉
│   ├── 위드런-미례국밥
│   ├── 위드런-댄싱컵
│   ├── 고벤처포럼
│   ├── 브랜드라이즈
│   ├── (HD현대오일뱅크)
│   └── 로그아웃
│
├── [전체 Overview]
│   ├── 월간 현황 (전체 stats)
│   ├── 이번 주 체크리스트
│   ├── 다음 일정
│   ├── 세금계산서 스케줄
│   └── 전체 주간 콘텐츠
│
└── [클라이언트 탭]
    ├── 채널 서브탭: [Instagram] [Naver Place] [Finance]
    ├── Instagram →
    │   ├── 캘린더 (사이드패널 편집)
    │   ├── 무드보드 (3열 그리드)
    │   ├── 레퍼런스 (썸네일 카드)
    │   └── KPI / 리포트 / 가이드
    ├── Naver Place →
    │   ├── 진단 점수 (100점)
    │   ├── 주간 미션 (체크리스트)
    │   └── 키워드 순위
    └── Finance →
        ├── 월 예산
        ├── 지출 현황
        └── 세금계산서
```

---

## 7. 구현 우선순위 (4/10 기준)

### Must (4/10까지)

| # | 작업 | 예상 |
|---|------|------|
| 1 | ProjectConfig 데이터 모델 마이그레이션 | 2h |
| 2 | Admin 사이드바 + 채널 서브탭 UI | 2h |
| 3 | 캘린더 UX: 사이드패널 편집 + 셀 썸네일 | 4h |
| 4 | 무드보드: 3열 인스타 그리드 | 2h |
| 5 | 레퍼런스: 썸네일 카드 그리드 (OG 이미지) | 2h |
| 6 | NP 진단 점수 블록 | 2h |
| 7 | NP 주간 미션 블록 | 2h |
| 8 | Finance 카드 (예산/세금계산서) | 2h |
| 9 | 전체 Overview 업데이트 (채널 통합) | 1h |
| 10 | 6개 브랜드 config 세팅 + 배포 | 1h |

**총 약 20시간** → 4일 집중이면 가능

### Nice-to-have (4/10 이후)

- 캘린더 드래그앤드롭 날짜 이동
- NP 키워드 순위 트래킹
- Blog 캘린더 블록
- KPI 구글시트 연동 안정화
- 팀원/Admin 권한 분리
- 클라이언트 온보딩 UI

---

## 8. 기술 스택 (변경 없음)

- Next.js 16 + React 19
- Tailwind CSS 4
- Vercel Blob (데이터 저장)
- Vercel 배포
- Google Sheets API (KPI, NP 마스터시트 — 기존 연동 유지)

---

## 9. 마이그레이션 전략

1. `ClientConfig` → `ProjectConfig`으로 타입 확장 (하위 호환)
2. 기존 `tabs: TabId[]` → `channels: ChannelConfig[]`으로 전환
3. 기존 탭샵바/휴닉 config를 새 구조로 변환
4. 새 브랜드 4개 config 추가 (위드런x2, 고벤처포럼, 브랜드라이즈)
5. `/clients/[slug]` 페이지는 채널 기반으로 리팩토링
