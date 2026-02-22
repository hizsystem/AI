# Context Sync - 2026-02-22

> 자동 수집 시각: 현재 시각

## 하이라이트

- 3개 소스 모두 수집 실패 (MCP 연결 및 스크립트 미설정)
- Connectors에서 Slack/Notion 연결 완료 후 재실행 필요
- Google Calendar는 API 스크립트 생성 필요

## Slack

**수집 실패** - Slack MCP 도구 미연결
- 원인: `mcp__claude_ai_Slack__slack_read_channel` 도구가 세션에 로드되지 않음
- 해결: claude.ai/settings/connectors에서 Slack 연결 완료 후 세션 재시작

## Google Calendar

**수집 실패** - 수집 스크립트 미생성
- 원인: `scripts/calendar_fetch.py` 파일이 아직 생성되지 않음
- 해결: Google Calendar API 설정 + 스크립트 작성 필요

## Notion

**수집 실패** - Notion MCP 서버 미연결
- 원인: `.mcp.json`에 Notion MCP 서버가 등록되지 않음
- 해결: claude.ai/settings/connectors에서 Notion 연결 또는 `claude mcp add` 실행

## 액션 아이템

- [ ] Connectors에서 Slack 연결 완료
- [ ] Connectors에서 Notion 연결 완료
- [ ] Google Calendar API 스크립트 작성 (calendar_fetch.py)
- [ ] 모든 연결 완료 후 "싱크해줘"로 재실행
