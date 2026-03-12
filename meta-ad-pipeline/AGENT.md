# brandrise Contents Pipeline — Orchestrator

> 3-Layer Agent System · 5 Agents · 10 Skills · 4 Workflows · Slack 연동

## 역할

이 파일은 **디렉터** 역할을 한다.
사용자 요청을 분석하여 적절한 워크플로우로 라우팅하고, 에이전트를 spawn한다.

## 라우팅 규칙

| 키워드 | 시리즈 | 워크플로우 |
|--------|--------|-----------|
| 광고, 소재, 메타, 인스타 광고, 성공사례 | ad-creative | workflows/ad-creative.md |
| 카드뉴스, 캐러셀, 슬라이드 | cardnews | workflows/cardnews.md |
| 피드, 인스타, 콘텐츠, SNS | instagram | workflows/instagram.md |
| 오늘, 데일리, daily, 콘텐츠 만들어 | daily-content | workflows/daily-content.md |

## Slack 연동

| 항목 | 값 |
|------|---|
| 채널 | Green 우성민 (self DM) |
| 채널 ID | `D065GRKNT4M` |
| 알림 도구 | `tools/slack_notify.py` |
| 설정 | `config/pipeline.json` |

Slack MCP 도구:
- `slack_send_message` — 컨펌 요청 전송
- `slack_read_channel` — 사용자 응답 읽기
- `slack_schedule_message` — 아침 스케줄링

## 게이팅 (Human-in-the-Loop)

AI가 단독으로 완성하지 않는다. 핵심 분기점에서 반드시 사용자 컨펌을 받는다.

| 컨펌 포인트 | 타이밍 | 내용 |
|------------|--------|------|
| 🔔 컨펌 1 | 리서치 후 | 방향성 + 핵심 메시지 승인 |
| 🔔 컨펌 2 | 카피 후 | 카피 시안 선택 (2-3안 중) |
| 🔔 컨펌 3 | 최종 렌더 후 | PNG 최종 승인 |

## 에이전트 Spawn 규칙

```
순서: researcher → copywriter → designer → developer → qa-reviewer
```

각 에이전트는 이전 에이전트의 산출물을 input으로 받는다.
에이전트 정의: `agents/` 디렉토리 참조.

## 공유 리소스

| 리소스 | 경로 | 용도 |
|--------|------|------|
| **타겟 인사이트 (초기)** | **research/TARGET-INSIGHT.md** | **⚠️ 세그먼트 2 (매출 0-10억) 전용** |
| **타겟 인사이트 (중기)** | **research/TARGET-INSIGHT-MID.md** | **⚠️ 세그먼트 3-4 (매출 10-100억) 전용** |
| 딥 리서치 원본 | research/*.md | Pain Point, 구매 트리거, 콘텐츠 패턴, 경쟁사 경험 |
| 세그먼트 맵 | research/TARGET-SEGMENTS.md | 5개 세그먼트 정의, 서비스 매핑 |
| Design System | design-system/ | 색상, 타이포, 레이아웃 규칙 |
| Templates | templates/ | HTML 슬라이드 템플릿 |
| Assets | assets/ | 제품 사진, 로고 등 |
| References | context/ | 포트폴리오, 세일즈 플랜 |

## 타겟 인사이트 (Research-First 원칙)

**모든 콘텐츠 제작은 타겟 인사이트에서 출발한다.**

### 세그먼트별 인사이트 라우팅

```
세그먼트 2 (매출 0-10억):
  research/TARGET-INSIGHT.md ← 종합 인사이트 (4개 딥 리서치 합본)
  ├── research/pain-points.md         (218줄, 20+ 소스)
  ├── research/purchase-triggers.md   (459줄, 33회 검색)
  ├── research/content-patterns.md    (342줄, 22 소스)
  └── research/competitor-experience.md (507줄, 38 소스)

세그먼트 3-4 (매출 10-100억) ← 최우선 타겟:
  research/TARGET-INSIGHT-MID.md ← 종합 인사이트 (2개 딥 리서치 합본)
  ├── research/segment3-mid-growth.md   (매출 10-30억, 32 소스)
  └── research/segment4-expansion.md    (매출 30-100억, 34 소스)

세그먼트 맵: research/TARGET-SEGMENTS.md (5개 세그먼트 정의)
```

에이전트 실행 순서: **세그먼트 확인 → 해당 인사이트 로딩 → 피드백 확인 → 작업 시작**

## 피드백 학습

모든 사용자 피드백은 `feedback/feedback.md`에 누적 기록한다.
에이전트는 작업 시작 시 feedback.md를 참조하여 이전 피드백을 반영한다.

## 산출물 경로

```
outputs/
├── slides/          # 시리즈별 HTML 슬라이드
├── images/          # 렌더링된 PNG
├── backgrounds/     # Gemini 배경 이미지
├── merged_html/     # 배경 합성된 HTML
└── captions/        # 인스타 캡션
```
