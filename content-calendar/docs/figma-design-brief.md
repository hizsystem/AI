# Brand Dashboard — Figma Design Brief

## Product Overview

Marketing agency의 브랜드 프로젝트 운영 컨트롤 타워.
6개 브랜드를 채널별(Instagram / Naver Place / Blog / Finance)로 관리하는 웹 대시보드.

- **사용자**: 마케팅 에이전시 내부 팀 (PM 1명 + 팀원 2~3명) + 클라이언트 (읽기 전용 공유 링크)
- **디바이스**: 데스크탑 위주 (1440px 기준), 태블릿 대응
- **톤앤매너**: 미니멀, 프로페셔널. Notion/Linear 스타일의 깔끔한 SaaS UI. 컬러 최소화, 그레이 베이스.

---

## Page Structure

### 1. Login Page (`/admin/login`)
- 센터 정렬 카드
- "Brand Dashboard" 타이틀 + "관리자 로그인" 서브타이틀
- 비밀번호 인풋 1개 + 로그인 버튼
- 에러 메시지 영역

### 2. Admin Dashboard (`/admin`)

**Layout**: Fixed left sidebar (224px) + Scrollable main content

#### 2-1. Sidebar
- **헤더**: "Brand Dashboard" + 현재 월 (예: "4월")
- **전체 탭**: 아이콘(햄버거) + "전체" 텍스트. 선택 시 bg-gray-50
- **구분선**
- **Active 섹션**: "ACTIVE" 라벨
  - 각 브랜드: 컬러 dot(5x5 rounded, brandColor) + 브랜드명 + (컨펌 필요 건수 뱃지, amber)
  - 브랜드 목록: 휴닉 / 미례국밥 / 댄싱컵 / 고벤처포럼 / 브랜드라이즈 / HD현대오일뱅크
- **Paused 섹션**: "PAUSED" 라벨, opacity-50
  - 탭샵바 (TAP SHOP BAR)
- **푸터**: "로그아웃" 링크

#### 2-2. Main Content — Overview (전체 탭)

**섹션 1: 월간 현황**
- 4열 카드 그리드: 전체(gray) / 기획(gray) / 컨펌 필요(amber border) / 완료(emerald border)
- 각 카드: 숫자(2xl bold) + 라벨(11px gray)

**섹션 2: 이번 주 체크리스트**
- 헤더: "이번 주 체크리스트" + 날짜 범위 (gray)
- 리스트: status dot(2x2) + 날짜 + 제목(truncate) + 브랜드명 + 상태 라벨
- 미완료 건만 표시

**섹션 3: 브랜드별 현황**
- 리스트: 컬러 바(2x6 rounded) + 브랜드명 + 채널 뱃지(IG/NP/BL/FN, 9px) + 콘텐츠 수 + 다음 일정

**섹션 4: 세금계산서 / 예산**
- 리스트: 브랜드명 + 발행일 + 월 예산 금액

#### 2-3. Main Content — Client Detail (브랜드 탭)

**헤더**
- 브랜드 아이콘(10x10 rounded, brandColor 배경, 이니셜) + 브랜드명 + 서브 브랜드 (예: "🌱 VEGGIET · 🫘 VINKER")
- PAUSED 뱃지 (해당 시)

**채널 서브탭** (해당 채널만 표시)
- 탭 바: [Instagram] [Naver Place] [Finance]
- 선택된 탭: border-bottom gray-900, 나머지: text-gray-400

**Instagram 탭 콘텐츠:**
- 4열 stats 카드 (Overview와 동일 구조)
- 다음 콘텐츠 카드: "다음 콘텐츠" 라벨 + 제목 + 날짜
- 이번 주 콘텐츠 리스트: status dot + 날짜 + 제목 + subtitle + 상태 라벨
- "캘린더 전체 보기 →" 링크 카드

**Naver Place 탭 콘텐츠:**
- **진단 점수**: 
  - 총점 카드: 큰 숫자(5xl) + "/100" + 등급(S/A/B/C/D) + 매장명/날짜
  - S/A/B/X 등급별 프로그레스 바: 라벨 + 점수/만점 + 바
    - S(red): 50점 만점
    - A(amber): 30점 만점
    - B(blue): 15점 만점
    - X(purple): 5점 만점
  - 항목 상세 리스트: ID(mono, gray) + 항목명 + 점수/만점 + status dot(green/amber/red)
- **주간 미션**:
  - 전체 진행률 프로그레스 바 (emerald)
  - 4주 타임라인:
    - Week 1 — 세팅 / Week 2 — 콘텐츠 / Week 3 — 확장 / Week 4 — 루틴화
    - 각 미션: 체크박스 + task 텍스트 + source(mono) + owner 뱃지("우리" blue / "사장님" amber)

**Finance 탭 콘텐츠:**
- 2열 카드: 월 예산 + 세금계산서 발행일
- 지출 현황 (empty state)

### 3. Client Calendar View (`/clients/[slug]`)

기존 콘텐츠 캘린더. 주요 변경점:

**캘린더 그리드**
- 7열 월간 그리드
- 각 셀: 날짜 + 콘텐츠 아이템들
- 콘텐츠 아이템: 
  - **썸네일 이미지** (있을 경우, w-full h-12 rounded)
  - 카테고리 컬러바 (left 3px) + 제목 (truncate)
  - 상태 뱃지

**사이드패널 (편집/뷰)**
- 우측에서 슬라이드 인 (480px)
- 반투명 오버레이 (bg-black/30)
- 캘린더는 뒤에서 보임 (컨텍스트 유지)

**무드보드**
- 사이드패널 형태 (480px)
- 3열 인스타 그리드 (gap 0.5)
- 정사각형 이미지, hover 시 라벨 오버레이
- 클릭 시 라이트박스

---

## Color System

| 용도 | 색상 |
|------|------|
| 텍스트 기본 | gray-900 |
| 텍스트 보조 | gray-400 |
| 배경 | gray-50 (페이지) / white (카드) |
| 보더 | gray-100 |
| 기획 상태 | gray-300 (dot) / gray-100 (bg) |
| 컨펌 필요 | amber-400 (dot) / amber-50 (bg) |
| 업로드 완료 | emerald-400 (dot) / emerald-50 (bg) |
| 브랜드별 accent | brandColor (config에서 지정) |

### Brand Colors
- 휴닉: #10b981 (emerald)
- 미례국밥: #d97706 (amber)
- 댄싱컵: #ec4899 (pink)
- 고벤처포럼: #1e40af (blue)
- 브랜드라이즈: #111827 (gray-900)
- HD현대오일뱅크: #dc2626 (red)
- 탭샵바: #4A7BF7 (blue)

---

## Typography

- Font: Geist Sans
- 헤더: text-base ~ text-2xl, font-semibold/bold
- 본문: text-sm (14px)
- 라벨: text-xs (12px), uppercase tracking-wider, text-gray-400
- 뱃지/태그: text-[10px] ~ text-[11px]
- 숫자 강조: text-2xl ~ text-5xl, font-bold

---

## Component Inventory

1. **SidebarNav** — fixed, 브랜드 목록 + active/paused 구분
2. **StatsCard** — 숫자 + 라벨, 4열 그리드
3. **ChecklistItem** — dot + 날짜 + 제목 + 브랜드 + 상태
4. **ChannelTabs** — 채널 서브탭 바
5. **AuditScoreCard** — 총점 + 등급별 프로그레스 바 + 항목 리스트
6. **WeeklyMissions** — 진행률 + 4주 타임라인 + 체크리스트
7. **FinanceCards** — 예산/세금계산서 카드
8. **CalendarGrid** — 7열 월간 캘린더 + 셀 썸네일
9. **SidePanel** — 우측 슬라이드 패널 (편집/뷰)
10. **InstagramGrid** — 3열 무드보드 그리드
11. **LoginCard** — 센터 정렬 로그인 폼

---

## Key Screens to Design

1. **Overview (전체 탭)** — 가장 중요. 모든 브랜드의 현황을 한눈에.
2. **Client Detail - Instagram 탭** — 채널 서브탭 + stats + 콘텐츠 리스트
3. **Client Detail - Naver Place 탭** — 진단 점수 + 주간 미션
4. **Client Detail - Finance 탭** — 예산/세금계산서
5. **Calendar with Side Panel** — 캘린더 + 우측 편집 패널
6. **Instagram Grid Moodboard** — 3열 그리드 사이드패널
7. **Login Page**
