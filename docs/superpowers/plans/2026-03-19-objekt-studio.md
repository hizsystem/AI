# Objekt Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI 기반 포토그래퍼 인스타그램 계정 @objekt.studio의 운영 시스템을 구축하고, Phase 0 (Visual Calibration)을 실행하여 첫 콘텐츠를 제작한다.

**Architecture:** 프로젝트 폴더 구조 + Brand Research 자동화 (Claude skill) + 프롬프트 템플릿 라이브러리 + QC 체크리스트 + 캡션 생성 시스템. 기존 `instagram-moodboard-system/`의 브랜드 분석 프레임워크를 재활용한다.

**Tech Stack:** Claude (리서치/캡션/프롬프트), AI 이미지 생성 툴 (Midjourney 우선, 힉스필드 보조), Instagram (수동 발행)

**Spec:** `docs/superpowers/specs/2026-03-19-objekt-studio-design.md`

---

## File Structure

```
clients/objekt-studio/
├── README.md                          # 프로젝트 개요 & 운영 가이드
├── identity/
│   ├── brand-identity.md              # 계정 아이덴티티 (handle, bio, PFP, 톤)
│   └── visual-tone-guide.md           # Phase 0에서 확립할 비주얼 톤 가이드
├── templates/
│   ├── brand-research-brief.md        # Brand Research Brief 템플릿
│   ├── prompt-templates.md            # AI 이미지 생성 프롬프트 템플릿 라이브러리
│   ├── caption-template.md            # 캡션 생성 템플릿 (국문+영문)
│   └── qc-checklist.md               # QC 체크리스트 (OK/NG 기준)
├── calibration/                       # Phase 0 결과물
│   ├── tool-comparison.md             # 툴 비교 테스트 결과
│   ├── references/                    # 카테고리별 벤치마크 레퍼런스
│   │   ├── beauty.md
│   │   ├── living.md
│   │   ├── fnb.md
│   │   └── fashion-accessories.md
│   └── pin-session-log.md            # 핀 맞추기 세션 기록 (OK/NG 분류 + 패턴)
├── brands/                            # 브랜드별 작업 폴더
│   └── _template/
│       └── brief.md                   # 브랜드 리서치 브리프 (생성 결과)
├── content/                           # 발행 콘텐츠 아카이브
│   ├── brand-sets/                    # Brand Set 캐러셀
│   └── daily-objects/                 # Daily Object 싱글 이미지
└── queue/
    └── brand-queue.md                 # 주간 브랜드 큐 (발행 예정)
```

---

### Task 1: 프로젝트 폴더 & 아이덴티티 문서 생성

**Files:**
- Create: `clients/objekt-studio/README.md`
- Create: `clients/objekt-studio/identity/brand-identity.md`
- Create: all subdirectories per file structure above

- [ ] **Step 1: 프로젝트 폴더 구조 생성**

```bash
mkdir -p clients/objekt-studio/{identity,templates,calibration/references,brands/_template,content/{brand-sets,daily-objects},queue}
```

- [ ] **Step 2: README.md 작성**

프로젝트 개요, 운영 방식, 주간 리듬(월: Brand Set, 수/금: Daily Object), 파이프라인 4단계 요약, 현재 Phase 상태를 포함.

- [ ] **Step 3: brand-identity.md 작성**

스펙에서 확정된 아이덴티티 정보 정리:
- Handle: @objekt.studio
- Display Name: OBJEKT
- PFP: "O" single letter, Helvetica Neue 200, off-white (#f5f0eb) background
- Bio: "Every object tells a brand story. / Visual direction & still life. / Seoul — Open for projects"
- Caption language: 국문 먼저 + 영문 + 해시태그
- Tone: 미니멀, 건조, 유럽 디자인 커뮤니티 친화

- [ ] **Step 4: Commit**

```bash
git add clients/objekt-studio/
git commit -m "feat: initialize objekt-studio project structure and identity"
```

---

### Task 2: Brand Research Brief 템플릿 구축

**Files:**
- Create: `clients/objekt-studio/templates/brand-research-brief.md`
- Reference: `clients/instagram-moodboard-system/veggiet/step1-brand-analysis.md` (기존 프레임워크 재활용)

- [ ] **Step 1: 기존 무드보드 시스템의 브랜드 분석 프레임워크 확인**

`clients/instagram-moodboard-system/veggiet/step1-brand-analysis.md`에서 재사용할 요소 식별:
- 브랜드 핵심 키워드 추출 구조
- 무드 키워드 프레임
- 컬러 방향 분석 패턴

- [ ] **Step 2: Objekt용 Brand Research Brief 템플릿 작성**

Objekt 특화 요소 추가:
```markdown
# Brand Research Brief: [브랜드명]

## 1. Brand Identity Snapshot
- 브랜드 포지셔닝 (한 줄)
- 핵심 키워드 3개
- 비주얼 아이덴티티: 컬러 팔레트, 타이포, 무드

## 2. Visual Interpretation Direction
- 톤 키워드 3개 (예: "quiet luxury", "raw texture", "warm minimal")
- Objekt 스타일 매핑: 에디토리얼 / 미니멀 / 라이프스타일 중 어느 결?
- 컬러 무드: 브랜드 컬러 기반 촬영 톤 방향
- 라이팅 방향: 자연광 / 스튜디오 / 드라마틱

## 3. Shot List
- Hero shot 컨셉 (1장)
- Detail/angle 변주 (2-3장)
- Closing mood (1장)

## 4. Prompt Draft
- [AI 이미지 생성 프롬프트 초안 — 툴별]

## 5. Caption Draft
- [국문 디렉션 노트]
- [English direction note]
- [해시태그 세트]
```

- [ ] **Step 3: Commit**

```bash
git add clients/objekt-studio/templates/brand-research-brief.md
git commit -m "feat: add brand research brief template for objekt-studio"
```

---

### Task 3: 캡션 생성 템플릿 & QC 체크리스트

**Files:**
- Create: `clients/objekt-studio/templates/caption-template.md`
- Create: `clients/objekt-studio/templates/qc-checklist.md`

- [ ] **Step 1: 캡션 템플릿 작성**

두 가지 포맷별 캡션 구조:

**Brand Set 캡션:**
```
[브랜드명]을 [톤 키워드]로 해석했다.
[1-2문장: 왜 이 톤인지, 브랜드의 어떤 면을 잡았는지]

[Brand name] through the lens of [tone keyword].
[1-2 sentences: interpretation rationale]

#objekt #visualdirection #stilllife #[브랜드명] #[카테고리태그]
```

**Daily Object 캡션:**
```
[제품명], [브랜드명].
[감성 한 줄 — 빛, 질감, 순간]

[Product name], [Brand name].
[One-line mood note]

#objekt #stilllife #[브랜드명]
```

- [ ] **Step 2: QC 체크리스트 초안 작성**

Phase 0에서 보완할 v0 체크리스트:

```markdown
# QC Checklist v0

## Hard NG (즉시 탈락)
- [ ] 손/손가락 형태 이상
- [ ] 텍스트/로고 왜곡 또는 의미 없는 글자
- [ ] 제품 형태 비현실적 변형
- [ ] 명백한 AI 패턴 (과도한 매끄러움, 대칭, 플라스틱 질감)

## Soft NG (보정 가능 여부 판단)
- [ ] 반사/그림자 부자연스러움
- [ ] 배경 디테일 이상 (녹아든 사물, 반복 패턴)
- [ ] 질감 뭉개짐 (천, 나무, 금속 등)
- [ ] 컬러 톤 불일치 (브랜드 무드와 안 맞음)

## OK 기준
- [ ] 3초 안에 "사진이다"라고 느껴지는가?
- [ ] 브랜드 톤과 일치하는가?
- [ ] 인스타 피드에 올렸을 때 이질감 없는가?
```

- [ ] **Step 3: Commit**

```bash
git add clients/objekt-studio/templates/caption-template.md clients/objekt-studio/templates/qc-checklist.md
git commit -m "feat: add caption template and QC checklist for objekt-studio"
```

---

### Task 4: 카테고리별 벤치마크 레퍼런스 수집

**Files:**
- Create: `clients/objekt-studio/calibration/references/beauty.md`
- Create: `clients/objekt-studio/calibration/references/living.md`
- Create: `clients/objekt-studio/calibration/references/fnb.md`
- Create: `clients/objekt-studio/calibration/references/fashion-accessories.md`

- [ ] **Step 1: 뷰티 카테고리 벤치마크 리서치**

Claude 웹 리서치로 수집. 각 카테고리별:
- 인스타 계정 3-5개 (제품 사진 퀄리티 높은 계정)
- 각 계정의 비주얼 특징 분석 (라이팅, 구도, 컬러 톤, 배경 처리)
- Objekt이 참고할 포인트 정리

대상 브랜드/계정 예시:
- Beauty: Aesop, Tamburins, Le Labo, Byredo, Glossier
- Living: HAY, Diptyque, Granhand, Cire Trudon, Menu
- F&B: Blue Bottle, Verve Coffee, Dandelion Chocolate, Market Kurly
- Fashion Acc: Gentle Monster, Bottega Veneta, COS, Arket

- [ ] **Step 2: 각 카테고리별 레퍼런스 문서 작성**

카테고리별로:
```markdown
# [Category] Visual References for Objekt

## Benchmark Accounts
1. @account_name — [비주얼 특징 요약]
2. ...

## Visual Patterns
- 라이팅: [패턴]
- 구도: [패턴]
- 컬러: [패턴]
- 배경: [패턴]

## Objekt Interpretation Notes
- 이 카테고리에서 Objekt이 택할 톤:
- 차별화 포인트:
```

- [ ] **Step 3: Commit**

```bash
git add clients/objekt-studio/calibration/references/
git commit -m "feat: add category benchmark references for visual calibration"
```

---

### Task 5: 프롬프트 템플릿 라이브러리 v0

**Files:**
- Create: `clients/objekt-studio/templates/prompt-templates.md`

- [ ] **Step 1: 범용 프롬프트 구조 설계**

카테고리/톤을 변수로 두는 모듈식 프롬프트:

```markdown
# Prompt Template Library v0

## Base Structure
[subject], [composition], [lighting], [background], [mood], [technical]

## Variables
- subject: "Aesop hand cream bottle" / "HAY ceramic mug"
- composition: "centered top-down" / "45-degree angle" / "hero shot with props"
- lighting: "soft natural afternoon light" / "studio softbox" / "dramatic side light"
- background: "crumpled linen fabric" / "concrete surface" / "marble slab"
- mood: "quiet luxury" / "warm minimal" / "raw and honest"
- technical: "shot on Phase One IQ4, 80mm lens, f/2.8" / "Hasselblad, natural color"

## Category Presets
### Beauty
[preset prompt for beauty products]

### Living
[preset prompt for living/home objects]

### F&B
[preset prompt for food & beverage packaging]

### Fashion Accessories
[preset prompt for fashion accessories]
```

- [ ] **Step 2: 카테고리별 프리셋 프롬프트 작성**

각 카테고리에 대해 Brand Set용 (히어로 + 디테일) 프롬프트 세트와 Daily Object용 프롬프트 세트를 작성. Task 4의 레퍼런스 분석 결과를 반영.

- [ ] **Step 3: Commit**

```bash
git add clients/objekt-studio/templates/prompt-templates.md
git commit -m "feat: add prompt template library v0 for objekt-studio"
```

---

### Task 6: 툴 비교 테스트 실행 (Phase 0 Week 1)

**Files:**
- Create: `clients/objekt-studio/calibration/tool-comparison.md`

- [ ] **Step 1: 무료 탐색 (구독 전)**

비용 없이 접근 가능한 옵션부터 테스트:
- DALL-E: ChatGPT Plus에 포함되어 있다면 바로 테스트
- Flux: fal.ai 또는 Replicate에서 pay-per-use (수 백원 단위)
- 힉스필드: 무료 체험판/크레딧 확인
- Midjourney: 웹 체험판 또는 Discord 확인

테스트 브리프: "Aesop hand cream on crumpled linen, soft afternoon light, shot on Hasselblad"

- [ ] **Step 2: 결과 기록**

```markdown
# Tool Comparison Test

## Test Brief
"Aesop hand cream on crumpled linen, soft afternoon light, shot on Hasselblad"

## Results

### [Tool Name]
- 접근 방식: [무료/유료/pay-per-use]
- 비용: [실제 발생 비용]
- 결과 퀄리티 (1-5):
- 사진 같은 정도 (1-5):
- 제품 정확도 (1-5):
- AI 티 나는 정도 (1-5, 낮을수록 좋음):
- 특이사항:
- 샘플 프롬프트 & 결과 이미지 파일명:
```

- [ ] **Step 3: 첫 구독 결정**

무료 테스트 결과 기반으로 유료 구독 1개 선택.
추천 기본값: Midjourney Basic ($10/mo) — 변경 가능.

- [ ] **Step 4: Round 1 본격 테스트 (구독 툴)**

동일 브리프로 각 카테고리별 5장씩 생성:
- Beauty: Aesop hand cream
- Living: Diptyque candle
- F&B: Blue Bottle coffee bag
- Fashion: COS leather bag

- [ ] **Step 5: tool-comparison.md 업데이트 & Commit**

```bash
git add clients/objekt-studio/calibration/tool-comparison.md
git commit -m "feat: complete Phase 0 tool comparison test round 1"
```

---

### Task 7: 핀 맞추기 세션 1 & NG 패턴 정의

**Files:**
- Create: `clients/objekt-studio/calibration/pin-session-log.md`
- Modify: `clients/objekt-studio/templates/qc-checklist.md` (v0 → v1 업그레이드)

- [ ] **Step 1: Task 6 결과물 리뷰**

생성된 이미지들을 함께 보면서 분류:
- OK: "이건 올릴 수 있다"
- NG: "이건 AI 티 난다" — 구체적으로 어디가 왜
- MAYBE: "보정하면 가능할 수도"

- [ ] **Step 2: NG 패턴 추출 & 기록**

```markdown
# Pin Session Log — Session 1

## Date: [날짜]

## OK Images
| # | Tool | Category | Why OK |
|---|------|----------|--------|

## NG Images
| # | Tool | Category | NG Reason (specific) |
|---|------|----------|---------------------|

## NG Patterns Identified
1. [패턴]: [설명] — [어떤 툴/카테고리에서 주로 발생]
2. ...

## Decisions
- [카테고리]에는 [툴]이 더 적합
- [이런 프롬프트 요소]를 추가하면 퀄리티 향상
```

- [ ] **Step 3: QC 체크리스트 v1로 업그레이드**

실제 NG 패턴 반영하여 `qc-checklist.md` 업데이트.

- [ ] **Step 4: Commit**

```bash
git add clients/objekt-studio/calibration/pin-session-log.md clients/objekt-studio/templates/qc-checklist.md
git commit -m "feat: complete pin session 1, upgrade QC checklist to v1"
```

---

### Task 8: 프롬프트 정교화 & 툴 매핑 확정 (Phase 0 Week 2)

**Files:**
- Modify: `clients/objekt-studio/templates/prompt-templates.md` (v0 → v1)
- Modify: `clients/objekt-studio/calibration/tool-comparison.md` (Round 2 추가)

- [ ] **Step 1: Round 2 테스트**

핀 맞추기 세션 1에서 확인된 개선점 반영:
- NG 패턴 회피 프롬프트 요소 추가
- 카테고리별 최적 툴로 재테스트
- 각 카테고리 1개 브랜드 × 5장

- [ ] **Step 2: 핀 맞추기 세션 2**

pin-session-log.md에 Session 2 추가.
최종 확정:
- 카테고리별 최적 툴 매핑
- 프롬프트 템플릿 v1 완성
- QC 체크리스트 최종본

- [ ] **Step 3: prompt-templates.md v1 완성**

실제 테스트에서 OK 받은 프롬프트를 기반으로 카테고리별 프리셋 확정.

- [ ] **Step 4: visual-tone-guide.md 작성**

Phase 0 전체 결과를 종합한 비주얼 톤 가이드:
```markdown
# Objekt Visual Tone Guide

## Overall Aesthetic
[Phase 0에서 확립된 Objekt 고유의 비주얼 언어]

## By Category
### Beauty — [톤], [라이팅], [구도], [최적 툴]
### Living — ...
### F&B — ...
### Fashion Acc — ...

## Tool Mapping
| Category | Primary Tool | Secondary | Notes |
|----------|-------------|-----------|-------|

## Prompt Principles
[OK를 만드는 프롬프트 원칙 3-5개]

## NG Avoidance
[반드시 피해야 할 프롬프트 패턴]
```

- [ ] **Step 5: Commit**

```bash
git add clients/objekt-studio/templates/prompt-templates.md clients/objekt-studio/calibration/ clients/objekt-studio/identity/visual-tone-guide.md
git commit -m "feat: complete Phase 0 Week 2, finalize tool mapping and visual tone guide"
```

---

### Task 9: 첫 Brand Set 제작 (Phase 0 마무리)

**Files:**
- Create: `clients/objekt-studio/brands/[brand-name]/brief.md`
- Create: `clients/objekt-studio/content/brand-sets/[brand-name]-set-1.md`

- [ ] **Step 1: 첫 브랜드 선정**

카테고리 중 Phase 0에서 가장 퀄리티 높았던 카테고리의 브랜드 1개 선택.
예: 뷰티가 가장 좋았으면 → Aesop 또는 Tamburins.

- [ ] **Step 2: Brand Research Brief 생성**

`templates/brand-research-brief.md` 템플릿에 따라 선정 브랜드의 브리프 작성.
Claude가 웹 리서치 기반으로 자동 생성.

- [ ] **Step 3: 이미지 생성 — 캐러셀 세트**

확정된 툴 + 프롬프트 템플릿으로:
- Hero shot 1장
- Detail/angle 변주 2-3장
- Closing mood 1장

- [ ] **Step 4: QC 체크리스트 적용**

v1 체크리스트로 전수 검사. NG → 재생성. OK → 최종 셀렉.

- [ ] **Step 5: 캡션 생성**

캡션 템플릿으로 국문+영문 캡션 + 해시태그 세트 작성.

- [ ] **Step 6: 콘텐츠 아카이브 저장**

```markdown
# Brand Set: [브랜드명] — Set 1

## Brand Brief Summary
[1-2줄 요약]

## Images
- hero.png: [설명]
- detail-1.png: [설명]
- detail-2.png: [설명]
- closing.png: [설명]

## Caption (KR)
[국문 캡션]

## Caption (EN)
[영문 캡션]

## Hashtags
[해시태그 세트]

## Tool Used
[사용 툴 + 프롬프트]

## QC Result
[통과 여부 + 특이사항]
```

- [ ] **Step 7: Commit**

```bash
git add clients/objekt-studio/brands/ clients/objekt-studio/content/brand-sets/
git commit -m "feat: complete first brand set — Phase 0 milestone"
```

---

### Task 10: 브랜드 큐 시스템 & 운영 가이드 완성

**Files:**
- Create: `clients/objekt-studio/queue/brand-queue.md`
- Modify: `clients/objekt-studio/README.md` (운영 가이드 추가)

- [ ] **Step 1: 초기 브랜드 큐 작성**

첫 4주 (12개 포스트) 분량의 브랜드 큐:

```markdown
# Brand Queue — Month 1

## Week 1
- Mon (Brand Set): [브랜드] — [카테고리] — [톤 키워드]
- Wed (Daily Object): [제품] — [브랜드]
- Fri (Daily Object): [제품] — [브랜드]

## Week 2
...

## Selection Criteria Applied
- 카테고리 로테이션: ✅
- 글로벌/국내 믹스: ✅
- 비주얼 아이덴티티 명확: ✅
```

- [ ] **Step 2: README.md에 운영 SOP 추가**

```markdown
## Daily Operation SOP

### Brand Set 제작 (월요일 발행용)
1. 브랜드 큐에서 이번 주 브랜드 확인
2. Claude에게 Brand Research Brief 요청: "[브랜드명] brand research brief"
3. 프롬프트 템플릿에서 카테고리 프리셋 선택
4. 이미지 생성 (3-5장)
5. QC 체크리스트 적용
6. OK 이미지 셀렉
7. Claude에게 캡션 요청
8. 인스타 앱에서 캐러셀 업로드 + 브랜드 태그

### Daily Object 제작 (수/금 발행용)
1. 브랜드 큐에서 제품 확인
2. 프롬프트 템플릿으로 이미지 1장 생성
3. QC 체크
4. 캡션 생성
5. 인스타 앱에서 싱글 이미지 업로드

### 주간 루틴
- 일요일: 다음 주 브랜드 큐 확인/조정
- 금요일: 주간 피드 리뷰 (피드 그리드 통일감 체크)
```

- [ ] **Step 3: Commit**

```bash
git add clients/objekt-studio/queue/brand-queue.md clients/objekt-studio/README.md
git commit -m "feat: add brand queue and operation SOP for objekt-studio"
```

---

## Execution Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | 프로젝트 폴더 & 아이덴티티 | — |
| 2 | Brand Research Brief 템플릿 | Task 1 |
| 3 | 캡션 템플릿 & QC 체크리스트 v0 | Task 1 |
| 4 | 카테고리별 벤치마크 레퍼런스 수집 | Task 1 |
| 5 | 프롬프트 템플릿 라이브러리 v0 | Task 4 |
| 6 | 툴 비교 테스트 (Phase 0 W1) | Task 5 |
| 7 | 핀 맞추기 세션 1 & NG 패턴 | Task 6 |
| 8 | 프롬프트 정교화 & 툴 매핑 확정 (Phase 0 W2) | Task 7 |
| 9 | 첫 Brand Set 제작 | Task 8 |
| 10 | 브랜드 큐 & 운영 가이드 | Task 9 |

**Tasks 1-3: 병렬 실행 가능** (폴더 생성 후 템플릿들은 독립적)
**Tasks 4-5: 병렬 실행 가능** (레퍼런스와 프롬프트 초안은 독립적)
**Tasks 6-9: 순차 실행 필수** (Phase 0 캘리브레이션 흐름)
**Task 10: Task 9 이후** (첫 콘텐츠 기준으로 큐 작성)
