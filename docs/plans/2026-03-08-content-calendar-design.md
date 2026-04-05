# 콘텐츠 캘린더 시스템 설계서

> 작성일: 2026-03-08
> 상태: 승인됨 (긴급 - 내일까지 MVP)

---

## 1. 개요

클라이언트에게 월간 콘텐츠 캘린더를 직관적으로 보여주는 웹 앱.
첫 번째 적용 대상: 탭샵바 (TAP SHOP BAR) 3월 인스타그램 콘텐츠.

### 핵심 요구사항
- 월간 캘린더 그리드 (라이트모드)
- 기획 꼭지(시리즈)별 컬러 구분
- 콘텐츠 클릭 → 오버뷰 모달 (일정, 멘션, 해시태그, 디자인 시안)
- 월별 네비게이션 (아카이빙)
- 클라이언트별 URL 분리 (/tabshopbar)
- Vercel 배포

### MVP에서 제외 (v2)
- 코멘트/피드백 스레드
- Google Sheets 연동
- 로그인/비밀번호 보호
- 실시간 알림

---

## 2. 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 스타일링 | Tailwind CSS |
| 데이터 | 정적 JSON 파일 |
| 이미지 | public/ 폴더 내 파일 |
| 배포 | Vercel |

---

## 3. 프로젝트 구조

```
content-calendar/
├── src/app/
│   ├── layout.tsx
│   ├── page.tsx              ← 리다이렉트 또는 랜딩
│   └── [client]/page.tsx     ← /tabshopbar
├── src/components/
│   ├── Calendar.tsx           ← 월간 그리드
│   ├── CalendarDay.tsx        ← 개별 날짜 셀
│   ├── ContentChip.tsx        ← 콘텐츠 칩 (컬러)
│   ├── ContentModal.tsx       ← 오버뷰 모달
│   ├── MonthNav.tsx           ← 월 네비게이션
│   └── CategoryLegend.tsx     ← 하단 범례
├── src/data/
│   └── tabshopbar/
│       ├── 2026-03.json       ← 3월 데이터
│       └── index.ts           ← 데이터 로더
├── public/
│   └── images/tabshopbar/     ← 시안/레퍼런스 이미지
├── tailwind.config.ts
├── package.json
└── next.config.ts
```

---

## 4. 데이터 스키마

```typescript
interface CalendarData {
  client: string;
  clientSlug: string;
  month: string;           // "2026-03"
  title: string;           // "3월 콘텐츠 캘린더"
  description: string;
  categories: Category[];
  items: ContentItem[];
}

interface Category {
  id: string;
  name: string;
  color: string;           // hex
}

interface ContentItem {
  id: string;
  date: string;            // "2026-03-10"
  endDate?: string;        // 다일 이벤트인 경우
  title: string;
  category: string;        // category.id 참조
  overview: {
    description?: string;
    format?: string;
    mentions?: string[];
    hashtags?: string[];
    images?: string[];
    caption?: string;
    notes?: string;
  };
}
```

---

## 5. 탭샵바 3월 카테고리

| ID | 시리즈명 | 컬러 |
|----|---------|------|
| place | #탭샵바플레이스 | #4A7BF7 (파랑) |
| pairing | #탭샵바페어링 | #E8A838 (주황) |
| scene | #탭샵바씬 | #45B26B (초록) |
| new-menu | #탭샵바뉴 | #9B59B6 (보라) |
| monthly-tap | #이달의탭 | #E05555 (빨강) |
| prep | 사전 준비 | #94A3B8 (회색) |
| story | 스토리 | #CBD5E1 (연회색) |
| event | 이벤트 | #F472B6 (핑크) |
