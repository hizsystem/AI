# 뉴비즈니스 마스터시트 — 구조 설계

> Google Sheets 기반 | GA4 연동 | UTM 자동 생성
> 생성일: 2026-03-05

---

## 탭 1: Dashboard (대시보드)

한눈에 KPI 현황을 파악하는 메인 화면.

| 셀 | 내용 | 수식/설명 |
|----|------|-----------|
| B2 | 이번 주 콘텐츠 발행 수 | `=COUNTA(Content!A:A)-1` |
| B3 | 이번 주 총 도달 | `=SUM(Content!G:G)` |
| B4 | 이번 주 링크 클릭 | `=SUM(Content!H:H)` |
| B5 | CTR (클릭률) | `=B4/B3*100` |
| B6 | 총 광고비 (이번 달) | `=SUM(AdSpend!F:F)` |
| B7 | 총 리드 수 | `=COUNTIF(Pipeline!F:F,"<>")` |
| B8 | 상담 완료 | `=COUNTIF(Pipeline!G:G,"완료")` |
| B9 | 수주 | `=COUNTIF(Pipeline!H:H,"수주")` |
| B10 | 수주율 | `=B9/B8*100` |
| B11 | 예상 매출 | `=SUMIF(Pipeline!H:H,"수주",Pipeline!I:I)` |

### KPI 목표 (월간)

| KPI | 목표 | 현재 | 달성률 |
|-----|------|------|--------|
| 콘텐츠 발행 | 12개/월 | =수식 | =수식 |
| 링크 클릭 | 200/월 | =수식 | =수식 |
| 리드 (진단 신청) | 20/월 | =수식 | =수식 |
| 상담 완료 | 10/월 | =수식 | =수식 |
| 수주 | 3/월 | =수식 | =수식 |
| 월 매출 | 900만원 | =수식 | =수식 |

---

## 탭 2: Content Tracker (콘텐츠 트래커)

콘텐츠별 성과를 추적하는 테이블.

| 컬럼 | 설명 | 예시 |
|------|------|------|
| A: 날짜 | 발행일 | 2026-03-05 |
| B: 채널 | 발행 채널 | Instagram / Threads / Blog |
| C: 시리즈 | 시리즈명 | Pain Series / Free Consult / Real Talk |
| D: 제목 | 콘텐츠 제목 | "메타 광고, 직접 세팅하고 계세요?" |
| E: UTM Campaign | UTM 캠페인값 | pain01_meta_ads |
| F: UTM Link | 전체 UTM 링크 | =수식 자동생성 |
| G: 도달/노출 | 도달 수 | 1,200 |
| H: 링크 클릭 | 클릭 수 | 45 |
| I: CTR | 클릭률 | =H/G*100 |
| J: 저장 | 저장 수 | 23 |
| K: 공유 | 공유 수 | 8 |
| L: 댓글 | 댓글 수 | 5 |
| M: 광고 여부 | 부스팅 여부 | Y / N |
| N: 비고 | 메모 | "광고 3일 집행" |

### UTM 자동 생성 수식 (F열)
```
=IF(B2="Instagram",
  "start.brandrise.co.kr?utm_source=instagram&utm_medium=post&utm_campaign="&E2,
  IF(B2="Threads",
    "start.brandrise.co.kr?utm_source=threads&utm_medium=post&utm_campaign="&E2,
    "start.brandrise.co.kr?utm_source="&LOWER(B2)&"&utm_medium=post&utm_campaign="&E2
  )
)
```

---

## 탭 3: Ad Spend (광고비 & 효율)

Meta 광고 캠페인별 비용과 성과.

| 컬럼 | 설명 | 예시 |
|------|------|------|
| A: 날짜 | 집행일 | 2026-03-05 |
| B: 캠페인명 | Meta 캠페인 이름 | free_consult01_conv |
| C: 콘텐츠 | 연결 콘텐츠 | Free Consult #1 |
| D: 목표 | 캠페인 목표 | 전환 / 트래픽 / 인지도 |
| E: 일예산 | 설정 예산 | 10,000 |
| F: 소진액 | 실제 소진 | 9,800 |
| G: 노출 | 노출 수 | 5,200 |
| H: 클릭 | 링크 클릭 | 120 |
| I: CPC | 클릭당 비용 | =F/H |
| J: CTR | 클릭률 | =H/G*100 |
| K: 전환 | 진단 신청 수 | 3 |
| L: CPA | 전환당 비용 | =F/K |
| M: ROAS | 광고 수익률 | 수주 시 역산 |
| N: 비고 | 메모 | "A/B 테스트 중" |

### 주간 요약 (하단 섹션)
- 주간 총 소진: `=SUMIFS(F:F, A:A, ">="&주시작, A:A, "<="&주끝)`
- 주간 평균 CPC: `=AVERAGE(I:I)`
- 주간 총 전환: `=SUMIFS(K:K, ...)`
- 주간 평균 CPA: `=주간소진/주간전환`

---

## 탭 4: Pipeline (리드 → 상담 → 수주)

영업 파이프라인 전체를 추적.

| 컬럼 | 설명 | 예시 |
|------|------|------|
| A: 유입일 | 진단 신청일 | 2026-03-05 |
| B: 이름/회사 | 리드 이름 | 김대표 / 슈퍼세이브 |
| C: 유입 경로 | UTM source | instagram / threads / direct |
| D: UTM Campaign | 어떤 콘텐츠에서 | free_consult01 |
| E: 연락처 | 이메일/전화 | kim@example.com |
| F: 상담 상태 | 진행 상태 | 신청 / 일정확정 / 완료 / 노쇼 |
| G: 상담일 | 미팅 날짜 | 2026-03-08 |
| H: 수주 상태 | 결과 | 검토중 / 수주 / 미수주 / 보류 |
| I: 예상 매출 | 프로젝트 금액 | 3,000,000 |
| J: 패키지 | 서비스 유형 | Essential / Professional / Premium |
| K: 비고 | 메모 | "올리브영 입점 니즈" |

### 전환 퍼널 요약 (하단 섹션)
```
진단 신청 → 일정 확정 → 상담 완료 → 수주
   20          15          10        3
  (100%)     (75%)       (50%)    (15%)
```

---

## 탭 5: UTM Generator (UTM 링크 생성기)

빠르게 UTM 링크를 만드는 도구.

| 셀 | 라벨 | 입력값 |
|----|------|--------|
| B2 | Base URL | start.brandrise.co.kr |
| B3 | Source | instagram / threads / facebook / blog |
| B4 | Medium | post / story / bio / ad / email |
| B5 | Campaign | free_consult01 / pain01_meta_ads |
| B6 | Content (선택) | slide01 / carousel / single |
| B8 | **생성된 URL** | =수식 자동 조합 |

### URL 생성 수식
```
=B2&"?utm_source="&B3&"&utm_medium="&B4&"&utm_campaign="&B5&IF(B6<>"","&utm_content="&B6,"")
```

### 숏링크 메모
- bit.ly 또는 dub.co로 숏링크 변환 후 사용
- 숏링크도 B9에 기록

---

## 시트 설정 메모

### 조건부 서식
- Pipeline 상태별 색상: 신청(노랑), 완료(초록), 수주(파랑), 노쇼(빨강)
- CTR 3% 이상: 초록 강조
- CPA 10,000원 이하: 초록 강조

### 데이터 유효성
- 채널: 드롭다운 (Instagram, Threads, Blog, Facebook, Email, Direct)
- 상담 상태: 드롭다운 (신청, 일정확정, 완료, 노쇼)
- 수주 상태: 드롭다운 (검토중, 수주, 미수주, 보류)
- 패키지: 드롭다운 (Essential, Professional, Premium)

### 보호/공유
- Dashboard: 수식 보호 (편집 불가)
- 나머지 탭: 편집 가능
