# Objekt Studio — AI Photographer Instagram Account Design

## Overview

AI 기반 이미지를 활용한 가상 포토그래퍼 포트폴리오 인스타그램 계정. 브랜드를 해석하는 감각과 감도를 보여주어, 실제 브랜드에서 촬영 제의가 들어오는 것이 최종 목표.

### Core Concept

- **"The Brand Lens"** — 주간 메인 브랜드 프로젝트 + 사이사이 데일리 오브제
- 다재다능한 포토그래퍼 페르소나: 브랜드에 따라 에디토리얼/미니멀/라이프스타일 톤을 자유롭게 오감
- 라이프스타일 오브제 전반 (뷰티, F&B 패키징, 리빙, 패션 소품)
- 모든 이미지는 AI 생성이나, AI스럽지 않은 퀄리티가 미션
- 비밀 운영: 회사 내부에서 "여기 스튜디오 한 번 알아보자"는 반응이 성공 지표

### Success Criteria

- 퀄리티 퍼스트: 피드만 보면 진짜 포토그래퍼라고 믿을 수준
- 타임라인 없이 퀄리티 기준 도달이 우선
- 궁극적으로 브랜드에서 DM/문의 수신

---

## 1. Account Identity

| Item | Value |
|------|-------|
| **Handle** | @objekt.studio |
| **Display Name** | OBJEKT |
| **Profile Picture** | "O" single letter, Helvetica Neue 200, off-white (#f5f0eb) background |
| **Bio** | Every object tells a brand story. / Visual direction & still life. / Seoul — Open for projects |
| **Bio Language** | English only (global positioning) |
| **Category** | Photographer / Visual Artist |

### Identity Rationale

- "Objekt" — 독일어 오브젝트. 사물/제품 중심 포지셔닝 명확. 유럽 디자인 커뮤니티 친화.
- ".studio" suffix — 개인이 아닌 스튜디오 운영자 느낌
- "O" PFP — 36px 원형(댓글/태그)에서도 선명. 미니멀 극대화.

---

## 2. Content System

### 2.1 Format: Brand Set (주 1회, 메인)

하나의 브랜드를 골라 "우리가 촬영했다면" 시리즈.

- **구성**: 캐러셀 3-5장
  - 1장: 히어로 샷 (브랜드 대표 제품, 풀 씬)
  - 2-3장: 디테일/앵글 변주
  - 마지막: 브랜드 로고 or 무드 클로징
- **캡션**: 브랜드 해석 디렉션 노트 (국문 + 영문)
- **태그**: 해당 브랜드 공식 계정
- **해시태그**: #visualdirection #stilllife #[브랜드명] + 카테고리 태그

### 2.2 Format: Daily Object (주 2회, 서브)

단일 오브제를 "작품"으로 승격하는 한 장.

- **구성**: 싱글 이미지 1장
- **캡션**: 미니멀 — 제품명, 브랜드명, 감성 한 줄 (국문 + 영문). 또는 무캡션.
- **태그**: 브랜드 태그
- **톤**: Brand Set보다 가볍고 일상적. 빛, 질감, 순간에 집중.

### 2.3 Caption Format (All Posts)

```
[국문 디렉션 노트 / 감성 카피]

[English direction note / caption]

#hashtags
```

국문 먼저, 영문은 한 줄 띄고, 해시태그는 맨 아래.

### 2.4 Weekly Rhythm

| Day | Format | Example |
|-----|--------|---------|
| Mon | Brand Set (carousel) | Aesop — "조용한 럭셔리"로 해석한 스킨케어 라인 |
| Wed | Daily Object (single) | Le Labo 캔들 — 오후 자연광 |
| Fri | Daily Object (single) | HAY 세라믹 머그 — 미니멀 탑뷰 |

### 2.5 Brand Selection Criteria

1. 비주얼 아이덴티티가 명확한 브랜드 — 해석할 거리가 있어야 함
2. 인스타 공식 계정이 활발한 브랜드 — 태그했을 때 볼 가능성
3. 카테고리 믹스 — 뷰티 → 리빙 → F&B → 패션소품 로테이션
4. 글로벌 + 국내 믹스 — Aesop 다음엔 탬버린즈, Diptyque 다음엔 그랑핸드

---

## 3. Pipeline & Automation

### 3.1 Overall Workflow

```
[Stage 1] Brand Research → [Stage 2] Visual Creation → [Stage 3] QC & Curation → [Stage 4] Publish
       자동화 가능              툴 테스트→자동화             수동 (핵심)              예약 발행
```

### 3.2 Stage 1: Brand Research (자동화)

- **입력**: 브랜드명 또는 카테고리
- **자동 수집**: 브랜드 공식 인스타, 웹사이트, 최근 캠페인, 비주얼 아이덴티티 분석
- **출력**: "Brand Interpretation Brief" — 톤 키워드 3개, 컬러 무드, 촬영 콘셉트 방향, 참고 레퍼런스
- **도구**: Claude (리서치 + 브리프 작성)

### 3.3 Stage 2: Visual Creation (D→C 전환 핵심)

**Phase 0 (초기 2주)**: 멀티툴 탐색
- 동일 브리프로 Midjourney / 힉스필드 / Flux / DALL-E 비교
- 카테고리별 최적 툴 매핑 확립
- 프롬프트 템플릿 라이브러리 구축

**Phase 1 (이후)**: 검증된 파이프라인
- Brand Brief → 프롬프트 자동 생성 → 이미지 생성 → 후보 3-5장 출력
- 브랜드 스타일에 따라 툴 자동 선택

### 3.4 Stage 3: QC & Curation (수동 유지)

"AI스럽지 않게" 만드는 핵심 단계. 자동화하지 않음.

- 후보 이미지 중 셀렉
- "AI 티"나는 요소 체크 (손, 텍스트, 질감 이상, 반사 부자연스러움)
- 필요 시 보정 지시 또는 재생성
- 최종 승인 → Stage 4로

### 3.5 Stage 4: Publish (수동 → 자동화)

**Initial**: 수동 발행 (인스타 앱에서 직접 업로드)
- 캡션은 Claude가 생성 (국문+영문 포맷)
- 해시태그 자동 구성
- 브랜드 태그 수동 삽입
- 직접 올리면서 피드 감각 유지

**Stable (안정화 후)**: API 연동 자동 발행
- 비즈니스/크리에이터 계정 전환 + Facebook Page 연동
- Instagram Graph API 또는 Later/Buffer 연동
- 예약 발행 자동화

### 3.6 Automation Scope by Phase

| Stage | Initial (D) | Stable (C) |
|-------|-------------|------------|
| Brand Research | Semi-auto (user + Claude) | Auto (weekly brand queue) |
| Visual Creation | Manual (tool testing) | Semi-auto (prompt → image pipeline) |
| QC & Curation | Manual (required) | **Manual (always)** |
| Publish | **Manual (앱 직접 업로드)** | Auto (API 예약 발행) |

---

## 4. Phase 0: Visual Calibration (2 Weeks)

"D→C 전환"의 D 단계. 툴 탐색, 비주얼 기준 확립, 첫 콘텐츠 제작.

### 4.1 Week 1: Exploration & Testing

| Day | Task |
|-----|------|
| 1-2 | **레퍼런스 수집** — 카테고리별(뷰티/리빙/F&B/패션소품) 벤치마크 인스타 계정 3-5개. 비주얼 기준선 확립. |
| 3-4 | **툴 테스트 Round 1** — 동일 브리프(예: "Aesop 핸드크림, 리넨 위, 오후 자연광")로 Midjourney / 힉스필드 / Flux / DALL-E 비교. 각 툴 5장씩. |
| 5 | **핀 맞추기 세션 1** — OK/NG 분류. "AI스럽다"의 기준 정의. NG 패턴 추출. |

### 4.2 Week 2: Convergence & First Content

| Day | Task |
|-----|------|
| 6-7 | **툴 테스트 Round 2** — 통과 툴로 4개 카테고리 각 1개 브랜드 테스트. 프롬프트 정교화. |
| 8-9 | **핀 맞추기 세션 2** — 카테고리별 최적 툴 확정. 프롬프트 템플릿 v1 완성. QC 체크리스트 확정. |
| 10 | **첫 Brand Set 제작** — 실제 발행용 퀄리티로 첫 캐러셀 완성. 기준점. |

### 4.3 Calibration Deliverables

1. **OK 기준** — "이건 올려도 된다" threshold
2. **NG 패턴 리스트** — "이건 AI 티 난다" (질감 뭉개짐, 로고 왜곡, 손/텍스트 이상 등)
3. **카테고리별 톤 가이드** — 뷰티 라이팅, 리빙 구도, F&B 컬러 등 "우리 스타일"
4. **툴 매핑** — 카테고리별 최적 AI 이미지 생성 툴
5. **프롬프트 템플릿 라이브러리 v1** — 재사용 가능한 프롬프트 구조

### 4.4 Post-Phase 0 Transition

```
Phase 0 완료 → 계정 개설 → Week 3부터 주 3회 발행 시작
                              ↓
                    첫 4주: 수동 운영 (D)
                              ↓
                    5주차~: 자동화 점진 도입 (C)
```

### 4.5 Tool Subscription Strategy (비용 최소화)

돈을 먼저 쓰지 않고, 단계적으로 검증 후 구독.

**Step 1: 무료 탐색 (Day 1-2)**
- Midjourney: Discord 무료 체험 또는 웹 체험판으로 첫 인상 확인
- DALL-E (ChatGPT Plus 포함): 이미 ChatGPT 구독 중이면 추가 비용 없이 테스트 가능
- Flux: Replicate, fal.ai 등 pay-per-use로 소량 테스트 (몇 백원 단위)
- 힉스필드: 무료 크레딧 또는 체험판 확인

**Step 2: 첫 구독 1개 (Day 3-4, 핀 맞추기 전)**
- Step 1 결과 중 가장 유망한 툴 1개만 월 구독
- 추천 우선순위: **Midjourney ($10/mo Basic)** — 제품/스틸라이프 범용성이 가장 높음
- 이 1개 툴로 Round 1 본격 테스트

**Step 3: 필요 시 추가 (Week 2)**
- 카테고리별 약점이 확인되면 보완 툴 1개 추가
- 예: Midjourney가 제품 정확도 부족 → 힉스필드 추가

**원칙: 동시 구독 최대 2개. 안 쓰는 툴은 즉시 해지.**

---

## 5. Claude Automation Capabilities

Phase 0 이후 Claude가 자동화할 수 있는 영역:

- **Brand Research Brief 자동 생성** — 브랜드명 입력 → 비주얼 아이덴티티 분석 + 촬영 콘셉트 + 프롬프트 초안
- **캡션 자동 생성** — 국문+영문, 해시태그 포함, Objekt 톤 유지
- **주간 브랜드 큐 추천** — 카테고리 로테이션 + 트렌드 반영
- **QC 체크리스트 자동 적용** — Phase 0에서 정의한 NG 패턴 기반 1차 스크리닝
- **프롬프트 최적화** — 이전 OK/NG 피드백 기반 프롬프트 자동 개선

---

## Appendix: Key Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Photographer persona style | Hybrid (D) | 브랜드별 톤 변주가 "해석력"의 증거 |
| Category scope | Lifestyle objects broad (C) | 콘텐츠 소재 다양성 + AI 이미지 안정성 |
| Publishing frequency | D→C (daily→3x/week) | 초기 톤 확립 후 고퀄리티 집중 |
| Success metric | Quality first (C) | 숫자보다 "진짜 포토그래퍼" 신뢰도 |
| Tool strategy | D→C (explore→hybrid) | 카테고리별 최적 툴 조합 수렴 |
| Content approach | The Brand Lens (C) | 깊이(해석력) + 감각(감도) 균형 |
| Account name | Objekt (B) | 독일어 미니멀, 제품 중심 포지셔닝 |
| Profile picture | "O" single letter | 36px 가독성 + 미니멀 자신감 |
| Bio language | English only | 글로벌 브랜드 태그 자연스러움 |
| Caption language | Korean + English | 글로벌 + 국내 브랜드 담당자 양쪽 커버 |
| Publishing method | Manual → API | 초기 앱 직접 업로드, 안정화 후 API 자동화 |
| Tool subscription | Step-by-step (max 2) | 무료 탐색 → 1개 구독 → 필요 시 추가 |
