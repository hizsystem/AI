---
name: my-context-sync
description: 나의 컨텍스트 싱크. 여러 소스에서 정보를 수집하고 하나의 문서로 정리한다. "싱크", "sync", "정보 수집" 요청에 사용.
triggers:
  - "싱크"
  - "sync"
  - "정보 수집"
  - "컨텍스트 싱크"
---

# My Context Sync

흩어진 정보를 한곳에 모아 정리하는 스킬.

Slack, Google Calendar, Notion에서 최근 정보를 수집하고,
하나의 마크다운 문서로 통합한다.

## 소스 정의

### 소스 1: Slack

| 항목 | 값 |
|------|-----|
| MCP 도구 | `mcp__claude_ai_Slack__slack_read_channel` |
| 수집 범위 | 최근 7일 |

수집할 채널 목록:

<!-- 자신이 주로 사용하는 채널명으로 바꾸세요 -->
```yaml
channels:
  - name: "general"          # 전체 공지
  - name: "project-updates"  # 프로젝트 소식
  - name: "random"           # 자유 채널
```

수집 방법:
```
각 채널에 대해 mcp__claude_ai_Slack__slack_read_channel 호출.
채널명과 메시지 개수(limit)를 전달한다.

Connectors로 연결한 경우:
  mcp__claude_ai_Slack__slack_read_channel(channel="general", limit=50)

claude mcp add로 연결한 경우:
  mcp__slack__slack_read_channel(channel="general", limit=50)
  (도구명은 연결 방식에 따라 다를 수 있음. /mcp로 확인)
```

추출할 정보:
- 중요 공지사항
- 의사결정 사항 ("확정", "결정", "합의" 키워드)
- 나에게 멘션된 메시지
- 답장이 필요한 질문

### 소스 2: Google Calendar

| 항목 | 값 |
|------|-----|
| 실행 방법 | Python 스크립트 (Google Calendar API) |
| 수집 범위 | 오늘 ~ 7일 후 |

<!-- 이 스크립트는 Block 2에서 Claude가 자동으로 작성해줍니다 -->

수집 방법:
```bash
uv run python .claude/skills/my-context-sync/scripts/calendar_fetch.py --days 7
```

추출할 정보:
- 오늘의 일정
- 이번 주 주요 미팅
- 준비가 필요한 미팅 (발표, 외부 미팅 등)
- 일정 충돌 여부

### 소스 3: Notion

| 항목 | 값 |
|------|-----|
| MCP 도구 | Notion MCP 서버 (`@notionhq/notion-mcp-server`) |
| 수집 범위 | 지정된 데이터베이스 |

<!-- Notion MCP 서버가 .mcp.json에 등록되어 있어야 합니다 -->
```yaml
databases:
  - name: "업무 태스크"
    id: "your-database-id"
  - name: "프로젝트 현황"
    id: "your-database-id"
```

수집 방법:
```
Notion MCP 서버의 도구를 사용하여 데이터베이스를 조회한다.

연결 방법 (택 1):
  - Connectors: claude.ai/settings/connectors 에서 Notion 연결 (가장 쉬움)
  - 명령어: claude mcp add --transport http notion https://mcp.notion.com/mcp

호출 예시:
  mcp__notion__query_database(database_id="your-database-id")
```

추출할 정보:
- 진행 중인 태스크
- 기한이 임박한 항목
- 최근 업데이트된 페이지

## 실행 흐름

이 스킬이 트리거되면 아래 순서로 실행한다.

### 1단계: 병렬 수집

3개 소스를 **동시에** 수집한다. 서로 의존성이 없으므로 병렬 실행이 가능하다.

```
수집 시작
  ├── [소스 1] Slack 채널 메시지 수집      ─┐
  ├── [소스 2] Google Calendar 일정 수집    ├── 병렬 실행
  └── [소스 3] Notion 태스크 수집           ─┘
수집 완료
```

각 소스 수집은 subagent(Task 도구)로 실행한다:

```
Task(description="Slack 수집", prompt="general, project-updates, random 채널에서 최근 7일 메시지를 수집하라")
Task(description="Calendar 수집", prompt="calendar_fetch.py를 실행하여 7일간 일정을 수집하라")
Task(description="Notion 수집", prompt="업무 태스크 DB에서 진행 중인 항목을 수집하라")
```

### 2단계: 결과 통합

수집된 정보를 하나의 문서로 합친다.

통합 규칙:
- 소스별 섹션으로 구분
- 각 섹션에서 "하이라이트" (중요 항목 3개 이내)를 선별
- 액션 아이템을 문서 하단에 모아서 정리
- 수집 실패한 소스는 "수집 실패" 표시와 함께 사유 기록

### 3단계: 문서 저장

결과 파일을 저장한다.

```
저장 위치: sync/YYYY-MM-DD-context-sync.md
```

### 4단계: 리포트

실행 결과를 사용자에게 보고한다.

```
싱크 완료!

수집 결과:
  Slack: 3개 채널, 47개 메시지
  Calendar: 8개 일정
  Notion: 15개 태스크

하이라이트 3건:
  1. [Slack] #project-updates: 배포 일정 확정 (2/20)
  2. [Calendar] 내일 10시 팀 미팅 (발표 자료 준비 필요)
  3. [Notion] 기한 임박 태스크 2건

액션 아이템:
  - [ ] 팀 미팅 발표 자료 준비
  - [ ] Slack #general 공지 확인
  - [ ] Notion 기한 초과 태스크 처리

파일 저장: sync/2026-02-22-context-sync.md
```

## 출력 포맷

**Markdown 파일** -- `sync/YYYY-MM-DD-context-sync.md`에 저장

저장되는 파일 구조:
```markdown
# Context Sync - YYYY-MM-DD

> 자동 수집 시각: HH:MM

## 하이라이트
- 소스별 중요 항목 3개 이내

## Slack
- 채널별 주요 메시지

## Google Calendar
- 오늘/이번 주 일정

## Notion
- 진행 중 태스크, 기한 임박 항목

## 액션 아이템
- [ ] 해야 할 일 목록
```

## 커스터마이징 가이드

### 소스 추가하기

새로운 소스를 추가하려면 "소스 정의" 섹션에 같은 형식으로 추가한다.

### 소스 제거하기

사용하지 않는 소스는 해당 "소스 N" 섹션 전체를 삭제한다.
실행 흐름의 병렬 수집 부분에서도 해당 줄을 제거한다.
