# NP 진단 자동화 시스템 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 네이버 플레이스 URL만 입력하면 자동 크롤링 + 수동 질문 7개로 100점 진단 리포트 + 코칭 태스크 + 패키지 견적을 자동 생성하는 시스템 구축

**Architecture:** `/np-audit` Claude 슬래시 커맨드가 WebFetch로 NP 페이지를 크롤링하여 자동 채점하고, 수동 질문으로 나머지를 채운 뒤, md 리포트 생성 + GAS webhook으로 구글시트 4개 탭에 데이터를 자동 분배한다.

**Tech Stack:** Claude Code 슬래시 커맨드 (.md), Google Apps Script (GAS), Google Sheets, WebFetch

---

## 파일 구조

| 파일 | 역할 | 생성/수정 |
|------|------|----------|
| `.claude/commands/np-audit.md` | `/np-audit` 슬래시 커맨드 정의 | 생성 |
| `scripts/np-audit-gas-v2.js` | GAS 확장 — 4개 탭 분배 + VLOOKUP 수식 | 생성 |
| `scripts/np-audit-sheet-setup.md` | 구글시트 5탭 세팅 가이드 | 생성 |
| `clients/_template/np-audit.md` | 진단 리포트 md 템플릿 | 생성 |

---

### Task 1: `/np-audit` 슬래시 커맨드 생성

**Files:**
- Create: `.claude/commands/np-audit.md`

이 파일이 시스템의 핵심. Claude에게 전체 진단 흐름을 지시하는 프롬프트.

- [ ] **Step 1: 기존 커맨드 구조 확인**

`.claude/commands/new-biz-prep.md` 등 기존 커맨드의 구조를 참고하여 동일한 패턴으로 작성한다.

- [ ] **Step 2: `/np-audit` 커맨드 파일 작성**

`.claude/commands/np-audit.md`에 아래 내용을 작성한다:

```markdown
# 네이버 플레이스 진단 (np-audit)

네이버 플레이스 URL을 받아 자동 크롤링 + 수동 확인으로 100점 만점 진단을 수행하고,
진단 리포트(md) + 코칭 태스크 + 패키지 견적을 자동 생성합니다.

사용자 입력: $ARGUMENTS

---

## 실행 모드

- `/np-audit lite {URL}` — Lite 진단 (자동 크롤링 + 수동 질문 7개 → 리포트 + 태스크 + 견적)
- `/np-audit full {URL}` — Full 진단 (Lite + 에드로그 + 경쟁사 + 키워드 심층 분석)
- `/np-audit {URL}` — 기본값은 lite

인자에서 URL을 파싱한다. URL이 없으면 물어본다.

---

## Phase 1: URL 파싱 + 자동 크롤링

### 1-1. URL에서 place ID 추출

URL 패턴: `m.place.naver.com/restaurant/{placeId}/home` 또는 `naver.me/...` 등
placeId를 추출하고, 정규화된 URL을 구성한다:
`https://m.place.naver.com/restaurant/{placeId}/home`

### 1-2. WebFetch로 NP 페이지 크롤링

WebFetch로 위 URL을 가져온다.

### 1-3. HTML에서 데이터 추출

아래 데이터를 HTML에서 파싱한다:

| 데이터 | 추출 방법 |
|--------|----------|
| 매장명 | `<title>` 또는 `<span class="...">` 헤더 영역 |
| 카테고리 | 업종 표시 텍스트 |
| 주소 | 주소 영역 텍스트 |
| 리뷰 수 | "방문자리뷰" 옆 숫자 파싱 |
| AI 브리핑 | AI 요약 텍스트 (있으면 ON, 없으면 OFF) |
| 메뉴 목록 | 메뉴명 + 가격 + 사진 유무 리스트 |
| 소개문 | 상세 소개 텍스트 전문 |
| 영업시간 | 영업시간 텍스트 (있으면 등록, 없으면 미등록) |
| 편의시설 | 편의시설 목록 |
| 길안내 | 교통 정보 텍스트 |

추가로 페이지 소스에서 `keywordList` 또는 `keywords` 메타태그를 검색하여 대표 키워드를 추출한다.

파싱이 잘 안 되는 항목은 빈값으로 두고 수동 질문 단계에서 보완한다.

### 1-4. 자동 채점

추출된 데이터로 아래 항목을 자동 채점한다:

**S1 영수증 리뷰 (16/20점 자동)**
- 리뷰 수: 0→0점, ~100→4점, ~300→8점, ~500→12점, 1000+→16점

**A1 대표 사진 & 영상 (2/8점 자동)**
- 메뉴별 사진 완비: 전 메뉴 사진 있음→2점, 일부 없음→1점, 대부분 없음→0점

**A2 대표 키워드 (5/8점 자동)**
- 키워드 세팅 유무: 있음→3점, 없음→0점
- 지역명 포함: 포함→2점, 미포함→0점

**B1 기본정보 완성도 (6/6점 자동)**
- 영업시간 등록→2점, 편의시설 등록→1점, 길안내 등록→1점, 업주인증(추정)→2점

**B2 소개문 (5/5점 자동)**
- 미작성→0점, 500자 미만→1점, 1000자→3점, 1500자+→5점

**B3 AI 브리핑 & 기타 (4/4점 자동)**
- AI 브리핑 켜기→2점, 매장명 지역명 포함→1점, 카테고리 최적화→1점

자동 채점 결과를 요약하여 사용자에게 보여준다:
```
자동 수집 완료:
- 매장명: {name} ({지역명 포함 여부})
- 리뷰: {count}개
- 메뉴: {count}개 (사진 {photo_count}개)
- 소개문: {char_count}자
- 대표 키워드: {keywords 또는 "미세팅"}
- AI 브리핑: {ON/OFF}
- 자동 채점: {auto_score}/{auto_max}점
```

---

## Phase 2: 수동 확인 질문 (7개)

자동으로 못 잡은 항목을 순차적으로 질문한다.
**한 메시지에 전부 물어본다** (하나씩 물어보면 시간 낭비):

```
자동 수집에서 확인 못 한 항목들을 체크해주세요:

1. 대표 사진 퀄리티 — 클릭하고 싶은 느낌인가요? (상/중/하)
2. 영상 소식이 업로드되어 있나요? (Y/N)
3. 예약 기능 ON? / 쿠폰 세팅? / 톡톡 활성화? (각각 Y/N)
4. 플레이스 광고 집행 중? (미집행/집행중/A/B테스트)
5. 리뷰 가이드 엽서나 이벤트 안내가 매장에 있나요? (Y/N)
6. 최근 30일 내 소식 발행? / 이벤트 연동? (각각 Y/N)
7. 인스타 연동? / 당근 비즈프로필? / 블로그 연동? / 네이버 커넥트? (각각 Y/N)
```

### 수동 채점 매핑

| 질문 | 답변 | 점수 |
|------|------|------|
| Q1 대표 사진 퀄리티 | 상→3, 중→2, 하→0 | A1 (3점) |
| Q2 영상 소식 | Y→3, N→0 | A1 (3점) |
| Q3 예약 | Y→5, N→0 | S3 |
| Q3 쿠폰 | Y→5, N→0 | S3 |
| Q3 톡톡 | Y→5, N→0 | S3 |
| Q4 광고 | 미집행→0, 집행중→10, A/B→15 | S2 (15점) |
| Q5 리뷰 유도 | Y→4, N→0 | S1 (4점) |
| Q6 소식 | Y→4, N→0 | A3 |
| Q6 이벤트 연동 | Y→3, N→0 | A3 |
| Q7 인스타 | Y→1, N→0 | X1 |
| Q7 당근 | Y→1, N→0 | X1 |
| Q7 블로그 | Y→1, N→0 | X1 |
| Q7 커넥트 | Y→2, N→0 | X2 |

---

## Phase 3: 종합 채점 + 등급 판정

자동 + 수동 점수를 합산하여 100점 만점으로 산출한다.

### 등급 판정
| 점수 | 등급 | 의미 |
|------|------|------|
| 80~100 | A | 잘 관리되는 매장 |
| 60~79 | B | 기본기는 있으나 빈틈 |
| 40~59 | C | 핵심 기능 미활용 |
| 0~39 | D | 방치 상태 |

### 항목별 판정 기준
| 득점률 | 판정 |
|--------|------|
| 90%+ | OK |
| 70~89% | 주의 |
| 40~69% | 개선 필요 |
| 0~39% | 즉시 개선 |

---

## Phase 4: 산출물 3종 자동 생성

### 4-1. md 진단 리포트

`clients/{store-slug}/np-audit.md`로 저장한다.
store-slug는 매장명을 영문 소문자+하이픈으로 변환 (예: "미례국밥 센텀점" → "mirye-gukbap-centum")
이미 존재하는 폴더면 그대로 사용, 없으면 생성.

리포트 구조:
```
# {매장명} 네이버 플레이스 진단 리포트

> 진단일: {날짜} | URL: {url} | 업종: {category} | 상권: {area}

---

## 종합 점수: {total} / 100점 [{grade}등급]

| 영역 | 점수 | 비중 |
|------|------|------|
| S등급 (매출 직결) | {s_total} / 50 | ████░░░░ |
| A등급 (노출 순위) | {a_total} / 30 | ████░░░░ |
| B등급 (기본기) | {b_total} / 15 | ████░░░░ |
| 보너스 (매출 부스터) | {x_total} / 5 | ████░░░░ |

---

## 즉시 개선 Top 3

{판정이 "즉시 개선"인 항목 중 배점 높은 순서대로 3개}

각 항목:
1. **{항목명}** — 현재: {현황} → 개선: {개선안}
   > {공식 데이터 근거 멘트 자동 삽입}

---

## 항목별 상세 진단

### S등급 — 매출 직결 ({s_total}/50)

#### S1. 영수증 리뷰 & 별점 ({s1_score}/20) — {s1_verdict}
- 현황: 리뷰 {review_count}개, 리뷰 유도 장치 {있음/없음}
- 개선안: {구체적 개선안}
- 근거: {공식 데이터 멘트}

#### S2. 플레이스 광고 ({s2_score}/15) — {s2_verdict}
...

#### S3. 예약 & 쿠폰 ({s3_score}/15) — {s3_verdict}
...

### A등급 — 노출 순위 ({a_total}/30)

#### A1. 대표 사진 & 영상 ({a1_score}/8) — {a1_verdict}
...

(... B등급, 보너스까지 동일 구조 ...)

---

## 잘하고 있는 것

{판정이 "OK"인 항목 나열}

---

## 추천 패키지

{등급 기반 패키지 추천}
- 기본: {패키지명}
- 옵션: {자동 추가된 옵션 항목}

---

## 4주 코칭 태스크 (요약)

| 주차 | 태스크 | 담당 |
|------|--------|------|
| Week 1 | {week1 태스크들} | {담당} |
| Week 2 | {week2 태스크들} | {담당} |
| Week 3 | {week3 태스크들} | {담당} |
| Week 4 | {week4 태스크들} | {담당} |

---
브랜드라이즈 | 네이버플레이스 최적화 코칭
```

### 4-2. 코칭 태스크 생성

"즉시 개선" 또는 "개선 필요" 판정 항목에서 태스크를 자동 생성한다.

태스크 변환 규칙:

| 진단 결과 | 태스크 | 우선순위 | 담당 |
|----------|--------|---------|------|
| S1 리뷰 유도 없음 | 영수증 리뷰 가이드 엽서 제작 + 배치 | week1 | 우리 |
| S2 광고 미집행 | 플레이스 광고 세팅 (일 5,000원~) | week1 | 우리 |
| S3 예약 OFF | 네이버 예약 활성화 | week1 | 사장님 |
| S3 쿠폰 OFF | 알림받기 쿠폰 세팅 | week1 | 사장님 |
| S3 톡톡 OFF | 톡톡 + 스마트콜 활성화 | week1 | 사장님 |
| A1 사진 미흡 | 대표 사진 재촬영 | week2 | 사장님 |
| A1 영상 없음 | 5~10초 영상 촬영 + 소식 업로드 | week2 | 사장님 |
| A2 키워드 미세팅 | 대표 키워드 5개 세팅 (지역명 필수) | week1 | 우리 |
| A2 키워드 지역명 없음 | 대표 키워드에 지역명 추가 | week1 | 우리 |
| A3 소식 없음 | 이벤트 소식 1개 발행 + 쿠폰 연동 | week2 | 사장님 |
| A4 체험단 없음 | 블로그 체험단 4~5명 섭외 | week2 | 우리 |
| B2 소개문 부족 | 상세 소개문 1,500자 작성 | week1 | 우리 |
| B3 매장명 지역명 없음 | 매장명에 지역명 추가 | week1 | 사장님 |
| X1 외부 채널 없음 | 인스타/당근 비즈프로필 세팅 | week3 | 사장님 |
| X2 커넥트 미등록 | 네이버 커넥트 전환 검토 | week3 | 사장님 |

### 4-3. 패키지 견적 산출

등급 → 패키지 자동 매핑:
- D~C등급 (0~59점) → 세팅 패키지 (PKG-SET)
- B등급 (60~79점) → 관리 패키지 (PKG-MNG)
- A등급 (80~100점) → 프리미엄 패키지 (PKG-PRM) or "잘 하고 계세요"

옵션 자동 추가:
- A4 "개선 필요" → OPT-BLOG (체험단)
- S2 "즉시 개선" → OPT-AD-SET (광고 세팅)
- A1 "개선 필요" (사진) → OPT-PHOTO (사진 촬영)
- B2 "개선 필요" → OPT-INTRO (소개문 작성)

---

## Phase 5: GAS Webhook 전송

진단 완료 후, 아래 JSON을 GAS webhook으로 전송한다.

WebFetch로 POST 요청:
- URL: GAS_WEBHOOK_URL (구글시트 Apps Script 배포 URL)
- Content-Type: application/json
- Body: 아래 JSON

```json
{
  "type": "full-audit",
  "store": {
    "name": "{매장명}",
    "category": "{업종}",
    "area": "{상권}",
    "url": "{플레이스 URL}"
  },
  "scores": {
    "s1": { "score": 12, "max": 20, "verdict": "개선 필요" },
    "s2": { "score": 0, "max": 15, "verdict": "즉시 개선" },
    "s3": { "score": 5, "max": 15, "verdict": "개선 필요" },
    "a1": { "score": 5, "max": 8, "verdict": "개선 필요" },
    "a2": { "score": 5, "max": 8, "verdict": "주의" },
    "a3": { "score": 0, "max": 7, "verdict": "즉시 개선" },
    "a4": { "score": 3, "max": 7, "verdict": "개선 필요" },
    "b1": { "score": 6, "max": 6, "verdict": "OK" },
    "b2": { "score": 3, "max": 5, "verdict": "개선 필요" },
    "b3": { "score": 3, "max": 4, "verdict": "OK" },
    "x1": { "score": 1, "max": 3, "verdict": "개선 필요" },
    "x2": { "score": 0, "max": 2, "verdict": "개선 필요" }
  },
  "total": 43,
  "grade": "C",
  "tasks": [
    { "task": "플레이스 광고 세팅", "priority": "week1", "owner": "우리", "source": "S2" },
    { "task": "예약 활성화", "priority": "week1", "owner": "사장님", "source": "S3" }
  ],
  "estimate": {
    "package": "PKG-SET",
    "options": ["OPT-AD-SET", "OPT-BLOG"]
  },
  "date": "{진단일}"
}
```

전송 성공 시: "구글시트에 데이터 전송 완료" 출력
전송 실패 시: JSON을 터미널에 출력하여 수동 복구 가능하게 함

---

## Phase 6: 완료 메시지

```
진단 완료!

📊 {매장명} — {total}점 / 100점 [{grade}등급]

즉시 개선 Top 3:
1. {항목} — {현황} → {개선안}
2. {항목} — {현황} → {개선안}
3. {항목} — {현황} → {개선안}

📄 리포트 저장: clients/{store-slug}/np-audit.md
✅ 구글시트 전송: 태스크 {n}개, 견적 {패키지명} + 옵션 {n}개
💰 추천 패키지: {패키지명}
```

---

## 공식 데이터 자동 삽입 멘트

리포트의 각 항목 "근거" 부분에 자동 삽입한다:

| 항목 | 조건 | 자동 멘트 |
|------|------|----------|
| S2 | 광고 미집행 | "플레이스 광고 사용 시 매출 6배, 저장 3.6배 증가 (D-플레이스 리포트)" |
| S3 | 예약 OFF | "네이버 공식 데이터: 예약 기능 사용 시 매출 6배, PV 3.1배 증가" |
| S3 | 쿠폰 OFF | "사업자 94.2%가 재활용 의향. 비수도권 효과 더 큼 (길찾기 2.51배)" |
| S3 | 톡톡 미활용 | "매월 최대 2,900명에게 무료 마케팅 메시지 발송 가능" |
| A1 | 영상 없음 | "영상 소식 업로드 시 플레이스 메인에 영상 노출 → 체류시간 증가" |
| B3 | AI 브리핑 OFF | "AI 브리핑: 체류시간 +10.4%, 클릭률 +27.4%, 예약·주문 +8% (네이버 공식)" |
| 전체 | 솔루션 0개 | "솔루션 1개 이상 사용 시 매출 3배 증가 (D-플레이스 리포트)" |
| X2 | 커넥트 미등록 | "Place+ 배지 부여, 인기 메뉴·방문 시간대·평균 결제 금액 자동 노출" |

## 메뉴명 키워드 분석 (보너스)

자동 크롤링에서 메뉴명을 가져왔으면, 리포트에 "메뉴명 키워드 최적화 제안" 섹션을 추가한다:
- 현재 메뉴명 나열
- 목적/강점 키워드 추가 제안 (예: "얼큰 돼지국밥" → "해장 얼큰 돼지국밥")
- 이 제안은 Claude가 업종과 메뉴 특성을 보고 직접 생성한다
```

- [ ] **Step 3: 커맨드 동작 확인**

Claude Code에서 `/np-audit` 입력 시 커맨드가 인식되는지 확인한다.

- [ ] **Step 4: Commit**

```bash
git add .claude/commands/np-audit.md
git commit -m "feat: /np-audit 슬래시 커맨드 생성 — 자동 크롤링 + 수동 질문 + 3종 산출물"
```

---

### Task 2: 진단 리포트 md 템플릿

**Files:**
- Create: `clients/_template/np-audit.md`

- [ ] **Step 1: 템플릿 파일 작성**

`clients/_template/np-audit.md`에 아래 내용을 작성한다. `/np-audit` 커맨드가 이 구조를 따라 리포트를 생성한다:

```markdown
# {매장명} 네이버 플레이스 진단 리포트

> 진단일: {날짜} | URL: {url}
> 업종: {category} | 상권: {area}

---

## 종합 점수: {total} / 100점 [{grade}등급]

| 영역 | 점수 |
|------|------|
| S등급 (매출 직결) | {s_total} / 50 |
| A등급 (노출 순위) | {a_total} / 30 |
| B등급 (기본기) | {b_total} / 15 |
| 보너스 (매출 부스터) | {x_total} / 5 |

---

## 즉시 개선 Top 3

1. **{항목}** — {현황} → {개선안}
   > {근거}
2. **{항목}** — {현황} → {개선안}
   > {근거}
3. **{항목}** — {현황} → {개선안}
   > {근거}

---

## 항목별 상세 진단

### S등급 — 매출 직결 ({s_total}/50)

#### S1. 영수증 리뷰 & 별점 ({score}/20) [{verdict}]
- **현황**: {현황 설명}
- **개선안**: {구체적 개선안}
- **근거**: {공식 데이터}

#### S2. 플레이스 광고 ({score}/15) [{verdict}]
- **현황**: {현황 설명}
- **개선안**: {구체적 개선안}
- **근거**: {공식 데이터}

#### S3. 예약 & 쿠폰 ({score}/15) [{verdict}]
- **현황**: {현황 설명}
- **개선안**: {구체적 개선안}
- **근거**: {공식 데이터}

### A등급 — 노출 순위 ({a_total}/30)

#### A1. 대표 사진 & 영상 ({score}/8) [{verdict}]
- **현황**: {현황 설명}
- **개선안**: {구체적 개선안}

#### A2. 대표 키워드 ({score}/8) [{verdict}]
- **현황**: 현재 키워드: {keywords}
- **개선안**: {구체적 개선안}

#### A3. 소식 & 이벤트 ({score}/7) [{verdict}]
- **현황**: {현황 설명}
- **개선안**: {구체적 개선안}

#### A4. 블로그 체험단 ({score}/7) [{verdict}]
- **현황**: {현황 설명}
- **개선안**: {구체적 개선안}

### B등급 — 기본기 ({b_total}/15)

#### B1. 기본 정보 완성도 ({score}/6) [{verdict}]
- **현황**: {현황 설명}

#### B2. 상세 소개문 ({score}/5) [{verdict}]
- **현황**: {글자수}자
- **개선안**: {구체적 개선안}

#### B3. AI 브리핑 & 기타 ({score}/4) [{verdict}]
- **현황**: AI 브리핑 {ON/OFF}, 매장명 지역명 {포함/미포함}

### 보너스 — 매출 부스터 ({x_total}/5)

#### X1. 외부 채널 연계 ({score}/3) [{verdict}]
- 인스타: {Y/N} | 당근: {Y/N} | 블로그: {Y/N}

#### X2. 네이버 커넥트 ({score}/2) [{verdict}]
- {등록/미등록}

---

## 잘하고 있는 것
{OK 판정 항목 나열}

---

## 메뉴명 키워드 최적화 제안

| 현재 메뉴명 | 제안 | 추가 키워드 |
|-----------|------|-----------|
| {메뉴1} | {제안1} | {키워드} |
| {메뉴2} | {제안2} | {키워드} |

---

## 추천 패키지: {패키지명}
- 기본: {패키지 설명}
- 옵션: {옵션 항목들}

## 4주 코칭 태스크

| 주차 | 태스크 | 담당 |
|------|--------|------|
{태스크 테이블}

---
브랜드라이즈 | 네이버플레이스 최적화 코칭
```

- [ ] **Step 2: Commit**

```bash
git add clients/_template/np-audit.md
git commit -m "feat: np-audit 리포트 md 템플릿 추가"
```

---

### Task 3: GAS v2 — 4개 탭 분배 스크립트

**Files:**
- Create: `scripts/np-audit-gas-v2.js`

- [ ] **Step 1: GAS 스크립트 작성**

`scripts/np-audit-gas-v2.js`에 아래 코드를 작성한다:

```javascript
/**
 * NP 진단 자동화 — GAS v2
 * 4개 탭에 데이터 자동 분배
 *
 * 사용법:
 * 1. Google Sheets에서 [확장 프로그램 > Apps Script] 열기
 * 2. 이 코드를 붙여넣기
 * 3. [배포 > 새 배포] → 유형: 웹 앱 → 액세스: 누구나 → 배포
 * 4. 생성된 URL을 /np-audit 커맨드의 GAS_WEBHOOK_URL에 설정
 */

// 탭 이름 상수
const TABS = {
  PRICE: '가격표',
  OVERVIEW: '매장 현황',
  DETAIL: '진단 상세',
  TASKS: '태스크',
  ESTIMATE: '견적'
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'full-audit') {
      writeOverview(ss, data);
      writeDetail(ss, data);
      writeTasks(ss, data);
      writeEstimate(ss, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', tabs_updated: 4 }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// [매장 현황] 탭에 요약 행 추가
function writeOverview(ss, data) {
  let sheet = getOrCreateSheet(ss, TABS.OVERVIEW, [
    '매장명', '업종', '상권', '총점', '등급',
    'S점수', 'A점수', 'B점수', '보너스',
    '진단일', '추천패키지', '계약상태'
  ]);

  const s = data.scores;
  const sTotal = s.s1.score + s.s2.score + s.s3.score;
  const aTotal = s.a1.score + s.a2.score + s.a3.score + s.a4.score;
  const bTotal = s.b1.score + s.b2.score + s.b3.score;
  const xTotal = s.x1.score + s.x2.score;

  sheet.appendRow([
    data.store.name,
    data.store.category,
    data.store.area,
    data.total,
    data.grade,
    sTotal,
    aTotal,
    bTotal,
    xTotal,
    data.date,
    data.estimate.package,
    '진단완료'
  ]);
}

// [진단 상세] 탭에 항목별 점수 추가
function writeDetail(ss, data) {
  let sheet = getOrCreateSheet(ss, TABS.DETAIL, [
    '매장명',
    'S1점수', 'S1판정', 'S2점수', 'S2판정', 'S3점수', 'S3판정',
    'A1점수', 'A1판정', 'A2점수', 'A2판정', 'A3점수', 'A3판정', 'A4점수', 'A4판정',
    'B1점수', 'B1판정', 'B2점수', 'B2판정', 'B3점수', 'B3판정',
    'X1점수', 'X1판정', 'X2점수', 'X2판정',
    '진단일'
  ]);

  const s = data.scores;
  sheet.appendRow([
    data.store.name,
    s.s1.score, s.s1.verdict, s.s2.score, s.s2.verdict, s.s3.score, s.s3.verdict,
    s.a1.score, s.a1.verdict, s.a2.score, s.a2.verdict, s.a3.score, s.a3.verdict, s.a4.score, s.a4.verdict,
    s.b1.score, s.b1.verdict, s.b2.score, s.b2.verdict, s.b3.score, s.b3.verdict,
    s.x1.score, s.x1.verdict, s.x2.score, s.x2.verdict,
    data.date
  ]);
}

// [태스크] 탭에 코칭 미션 추가
function writeTasks(ss, data) {
  let sheet = getOrCreateSheet(ss, TABS.TASKS, [
    '매장명', '태스크', '우선순위', '담당', '상태', '생성일', '마감', '출처항목', '비고'
  ]);

  const baseDate = new Date(data.date);

  data.tasks.forEach(function(t) {
    const weekNum = parseInt(t.priority.replace('week', ''));
    const deadline = new Date(baseDate);
    deadline.setDate(deadline.getDate() + (weekNum * 7));

    sheet.appendRow([
      data.store.name,
      t.task,
      t.priority,
      t.owner,
      '미완료',
      data.date,
      Utilities.formatDate(deadline, 'Asia/Seoul', 'yyyy-MM-dd'),
      t.source,
      ''
    ]);
  });
}

// [견적] 탭에 패키지 + 옵션 추가 (VLOOKUP 수식 포함)
function writeEstimate(ss, data) {
  let sheet = getOrCreateSheet(ss, TABS.ESTIMATE, [
    '매장명', '등급', '추천패키지', '기본가', '옵션항목', '옵션가', '합계', '제안일', '상태'
  ]);

  const row = sheet.getLastRow() + 1;
  const priceTab = TABS.PRICE;
  const optionsList = data.estimate.options.join(', ');

  // 기본가: 가격표 탭에서 VLOOKUP
  const basePriceFormula = '=IFERROR(VLOOKUP("' + data.estimate.package + '",' + priceTab + '!A:B,2,FALSE),0)';

  // 옵션가: 각 옵션의 가격을 합산
  let optionFormulaParts = data.estimate.options.map(function(opt) {
    return 'IFERROR(VLOOKUP("' + opt + '",' + priceTab + '!A:B,2,FALSE),0)';
  });
  const optionPriceFormula = optionFormulaParts.length > 0
    ? '=' + optionFormulaParts.join('+')
    : '=0';

  // 합계: 기본가 + 옵션가
  const totalFormula = '=D' + row + '+F' + row;

  sheet.getRange(row, 1).setValue(data.store.name);
  sheet.getRange(row, 2).setValue(data.grade);
  sheet.getRange(row, 3).setValue(data.estimate.package);
  sheet.getRange(row, 4).setFormula(basePriceFormula);
  sheet.getRange(row, 5).setValue(optionsList);
  sheet.getRange(row, 6).setFormula(optionPriceFormula);
  sheet.getRange(row, 7).setFormula(totalFormula);
  sheet.getRange(row, 8).setValue(data.date);
  sheet.getRange(row, 9).setValue('제안 전');
}

// 탭 없으면 생성 + 헤더 추가
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f3f4f6');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// GET 요청 테스트용
function doGet() {
  return ContentService
    .createTextOutput('NP 진단 자동화 GAS v2 정상 동작 중')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/np-audit-gas-v2.js
git commit -m "feat: GAS v2 — 4개 탭 분배 (매장현황/진단상세/태스크/견적) + VLOOKUP 수식"
```

---

### Task 4: 구글시트 세팅 가이드

**Files:**
- Create: `scripts/np-audit-sheet-setup.md`

- [ ] **Step 1: 세팅 가이드 작성**

`scripts/np-audit-sheet-setup.md`에 아래 내용을 작성한다:

```markdown
# NP 코칭 마스터시트 세팅 가이드

## 1. 새 구글 스프레드시트 생성

이름: "NP 코칭 마스터시트"

## 2. [가격표] 탭 수동 생성

이 탭만 직접 만들면 나머지 4개 탭은 GAS가 첫 데이터 수신 시 자동 생성한다.

| A열 (항목코드) | B열 (금액) |
|---------------|-----------|
| PKG-SET | (세팅 패키지 가격 입력) |
| PKG-MNG | (관리 패키지 가격 입력) |
| PKG-PRM | (프리미엄 패키지 가격 입력) |
| OPT-BLOG | (체험단 5팀 가격 입력) |
| OPT-AD-SET | (광고 세팅 가격 입력) |
| OPT-AD-MNG | (광고 월 운영 가격 입력) |
| OPT-PHOTO | (사진 촬영 가격 입력) |
| OPT-INTRO | (소개문 작성 가격 입력) |

## 3. GAS 배포

1. [확장 프로그램 > Apps Script] 열기
2. `scripts/np-audit-gas-v2.js` 코드 전체 복사 → 붙여넣기
3. [배포 > 새 배포] 클릭
4. 유형: 웹 앱
5. 실행 주체: 본인
6. 액세스: 누구나
7. [배포] 클릭 → URL 복사

## 4. Webhook URL 설정

복사한 URL을 기록해둔다. `/np-audit` 커맨드 실행 시 이 URL로 데이터를 전송한다.

현재 URL: (배포 후 여기에 기록)

## 5. 테스트

GAS 배포 URL에 브라우저로 접속하면 "NP 진단 자동화 GAS v2 정상 동작 중" 메시지가 나와야 한다.

## 6. 나머지 탭 자동 생성

첫 `/np-audit` 실행 시 아래 4개 탭이 자동 생성된다:
- [매장 현황] — 전 매장 점수/등급 한눈에
- [진단 상세] — 13개 항목별 점수 원본
- [태스크] — 매장별 코칭 미션 + 완료 체크
- [견적] — 패키지 추천 + VLOOKUP 자동 산출 금액
```

- [ ] **Step 2: Commit**

```bash
git add scripts/np-audit-sheet-setup.md
git commit -m "docs: 구글시트 세팅 가이드 — 가격표 탭 + GAS 배포 방법"
```

---

### Task 5: 실전 테스트 — 미례국밥 센텀점

**Files:**
- Modify: `clients/mirye-gukbap/np-audit.md` (기존 수동 리포트 → v2 자동 리포트로 교체)

- [ ] **Step 1: `/np-audit` 실행**

```
/np-audit lite https://m.place.naver.com/restaurant/2085068967/home
```

- [ ] **Step 2: 자동 크롤링 결과 확인**

WebFetch로 페이지 크롤링 후 자동 수집 데이터가 정상 추출되는지 확인한다:
- 매장명, 리뷰 수, 메뉴, 소개문, 키워드 등

- [ ] **Step 3: 수동 질문 답변**

7개 질문에 답변한다. (실제 미례국밥 데이터 기반으로 답변)

- [ ] **Step 4: 산출물 확인**

1. `clients/mirye-gukbap/np-audit.md` 생성/갱신 확인
2. 구글시트 4개 탭에 데이터 정상 입력 확인
3. 견적 VLOOKUP 수식 동작 확인

- [ ] **Step 5: Commit**

```bash
git add clients/mirye-gukbap/np-audit.md
git commit -m "test: 미례국밥 센텀점 np-audit v2 자동 진단 테스트"
```

---

### Task 6: 두 번째 매장 테스트 + CLAUDE.md 업데이트

**Files:**
- Modify: `CLAUDE.md` (워크플로우 커맨드 목록에 `/np-audit` 반영)

- [ ] **Step 1: 다른 매장으로 `/np-audit` 실행**

기존 클라이언트 중 하나 (예: sams-cabin 또는 새 매장)로 테스트하여 범용성 확인.

- [ ] **Step 2: CLAUDE.md 업데이트**

워크플로우 커맨드 테이블에 `/np-audit` 관련 설명을 업데이트한다:

기존:
```
| `/np-audit` | 100점 만점 플레이스 진단 리포트 (lite: 무료 1장 / full: 풀 진단서) |
| `/np-audit lite` | Lite 진단 — URL + 체크리스트 → 100점 채점 + 1장 리포트 (15분, 영업용) |
| `/np-audit full` | Full 진단 — 에드로그 + 경쟁사 + 키워드 → 풀 진단서 + 4주 액션 플랜 |
```

변경:
```
| `/np-audit` | 100점 만점 플레이스 진단 (v2: 자동 크롤링 + 수동 질문 7개 → md 리포트 + 구글시트 태스크/견적) |
| `/np-audit lite` | Lite 진단 — URL → 자동 크롤링 + 확인 질문 → 리포트 + 태스크 + 견적 (~5분) |
| `/np-audit full` | Full 진단 — Lite + 에드로그 + 경쟁사 + 키워드 심층 분석 |
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md clients/
git commit -m "feat: /np-audit v2 완성 — CLAUDE.md 업데이트 + 2차 테스트"
```
