# Debug Agent Team - Design Spec

**Date**: 2026-03-24
**Status**: Draft
**Scope**: 범용 (모든 프로젝트 적용)

## Problem

시스템(앱/서버) 구축 시 동일한 오류가 반복 발생하지만, 이전 세션에서 어떻게 수정했는지 기록이 없어 매번 처음부터 디버깅을 반복한다. 세션 간 기억이 전달되지 않아 같은 삽질이 계속된다.

## Solution

3개 전문 에이전트 + 구조화된 지식 베이스로 구성된 디버깅 시스템. 오류 발생 시 이력 기반 빠른 해결, 코드 작성 시 사전 예방을 동시에 수행한다.

---

## 1. 지식 베이스 구조

### 저장 위치

```
.claude/debug-knowledge/              # 공통 (범용 패턴)
├── index.md                           # 전체 이슈 목록 (빠른 검색용)
├── issues/
│   ├── 001-video-upload-fail.md
│   ├── 002-cors-api-route.md
│   └── ...
└── patterns/
    ├── next-file-upload.md
    ├── api-route-cors.md
    └── ...
```

워크트리별 전용 지식 베이스:

```
.claude/worktrees/{project}/.claude/debug-knowledge/
```

검색 순서: 워크트리 전용 -> 공통. 프로젝트 전용 이슈가 범용 패턴이면 공통으로 승격.
승격 기준: 2개 이상 다른 프로젝트에서 동일 패턴 발생 시 공통으로 이동.

### ID 부여 규칙

새 이슈 생성 시 index.md에서 가장 높은 ID를 읽고 +1 증가. 3자리 zero-padding (001, 002, ...). 삭제된 ID는 재사용하지 않는다.

### 이슈 파일 포맷 (issues/)

```markdown
---
id: 001
title: 동영상 업로드 실패
project: tapshopbar
tags: [file-upload, next.js, api-route]
occurrences: 2
first_seen: 2026-03-10
last_seen: 2026-03-22
status: resolved
---

## 증상
동영상 업로드 시 413 에러 발생, 10MB 이상 파일에서 재현

## 근본 원인
Next.js API 라우트의 기본 body size limit이 4MB로 설정되어 있음

## 수정 내용
- next.config.js에 api.bodyParser.sizeLimit: '50mb' 추가
- 업로드 API 라우트에 청크 업로드 로직 적용

## 수정 파일
- next.config.js (L12-15)
- app/api/upload/route.ts (L30-55)

## 재발 방지
- [ ] 새 API 라우트 생성 시 body size limit 확인
- [ ] 파일 업로드 기능 추가 시 이 이슈 참조

## 이력
| 날짜 | 발생 | 해결 방법 | 비고 |
|------|------|----------|------|
| 2026-03-10 | 1차 | sizeLimit 추가 | |
| 2026-03-22 | 2차 | 같은 설정이 빠져있었음 | 새 라우트에서 재발 |
```

### 패턴 파일 (patterns/)

같은 유형의 이슈가 2회 이상 발생하면 일반화된 패턴 가이드로 승격.

```markdown
---
pattern: next-file-upload
related_issues: [001, 007]
applies_to: [next.js, file-upload]
---

## Next.js 파일 업로드 체크리스트
1. next.config.js에 bodyParser.sizeLimit 설정 확인
2. 클라이언트 파일 사이즈 검증 추가
3. 청크 업로드 여부 결정 (10MB 이상이면 필수)
4. 에러 핸들링: 413, 500, timeout 각각 처리
```

### index.md 포맷

```markdown
# Debug Knowledge Index

## Issues
| ID | Title | Project | Tags | Occurrences | Status |
|----|-------|---------|------|-------------|--------|
| 001 | 동영상 업로드 실패 | tapshopbar | file-upload, next.js | 3 | resolved |
| 002 | CORS API 라우트 | huenic | cors, api | 2 | resolved |

## Patterns
| Pattern | Related Issues | Applies To |
|---------|---------------|------------|
| next-file-upload | 001, 007 | next.js, file-upload |
| api-route-cors | 002, 005 | next.js, cors |
```

---

## 2. 에이전트 설계

### 2.1 Bug Detective (버그 탐정)

- **파일명**: `bug-detective.md`
- **역할**: 오류 발생 시 가장 먼저 호출. 이력 조회 + 근본 원인 추적
- **동작 시점**: 문제 발생 시 (사후 대응)

**프레임워크: SEARCH -> MATCH -> DIAGNOSE**

1. SEARCH: 에러 메시지, 증상, 관련 파일명으로 debug-knowledge/index.md 검색
2. MATCH: 기존 이슈와 매칭 판단 (일치 / 유사 / 신규)
3. DIAGNOSE: 매칭 시 이전 근본 원인 제시, 신규면 근본 원인 분석 수행

**핵심 원칙:**
- 수정에 손대기 전에 반드시 이력부터 조회
- 진단 결과에 매칭 이슈 번호를 포함하여 픽스 아키텍트에게 전달
- "이거 N번째 발생입니다"를 명확히 보고

**커뮤니케이션:**
- "이 오류는 #001과 동일한 패턴입니다. 이전에는 sizeLimit 설정 누락이 원인이었습니다."
- "신규 이슈입니다. 근본 원인 분석 결과: ..."

### 2.2 Fix Architect (픽스 아키텍트)

- **파일명**: `fix-architect.md`
- **역할**: 진단 결과를 받아 최적 수정 방안 설계. 재발 방지 중심.
- **동작 시점**: 진단 후 수정 시 (사후) + 코드 리뷰 시 (예방)

**프레임워크: REVIEW -> DESIGN -> PREVENT**

1. REVIEW: 버그 탐정의 진단 + 매칭된 이전 수정 이력 검토
2. DESIGN: 수정 방안 설계 (이전 수정이 있으면 그 패턴 기반, 없으면 신규)
3. PREVENT: 같은 문제가 재발하지 않도록 방어 코드/검증 로직 추가

**핵심 원칙:**
- 이전에 같은 방식으로 고쳤는데 재발했다면 다른 방법 제안 (임시 fix 반복 금지)
- 수정 시 "왜 이전 수정이 지속되지 못했는가" 분석
- patterns/ 가이드가 있으면 반드시 참조

**커뮤니케이션:**
- "이전 수정은 config만 변경했는데 새 라우트에서 재발했습니다. 이번에는 미들웨어 레벨에서 글로벌 적용하겠습니다."
- "이 유형의 문제에 대한 패턴 가이드가 있습니다: patterns/next-file-upload.md"

### 2.3 Knowledge Keeper (지식 관리자)

- **파일명**: `knowledge-keeper.md`
- **역할**: 수정 완료 후 기록 + 코딩 시 사전 경고. 팀의 장기 기억.
- **동작 시점**: 수정 후 기록 (사후) + 코드 작성 시 경고 (예방)

**프레임워크: RECORD -> INDEX -> GUARD**

1. RECORD: 수정 완료 후 이슈 파일 작성/업데이트 (증상, 원인, 수정, 재발방지)
2. INDEX: index.md 업데이트 + 2회 이상 발생한 이슈는 패턴으로 승격 제안
3. GUARD: `/debug-check` 호출 시 관련 이슈/패턴이 있으면 사전 경고 (자동 트리거 아님, 명시적 호출만)

**핵심 원칙:**
- 수정이 끝나면 반드시 호출 (기록 없는 수정은 없던 일)
- occurrences 2회 이상이면 패턴 파일 생성을 사용자에게 제안 (사용자 승인 후 생성)
- 워크트리 전용 vs 공통 판단하여 적절한 위치에 저장

**커뮤니케이션:**
- "이슈 #001 업데이트 완료. 발생 횟수: 2->3회. 패턴 가이드 생성을 권장합니다."
- "이 파일(upload/route.ts)과 관련된 이슈가 2건 있습니다: #001, #007"

---

## 3. 커맨드

각 커맨드는 단일 프롬프트 파일(.claude/commands/*.md)로 구현한다. 커맨드 내부에서 3개 에이전트의 프레임워크를 순차 실행하는 구조이며, 별도 에이전트를 체이닝하는 것이 아니다. 에이전트 .md 파일은 개별 호출용 레퍼런스 및 /review 등에서 단독 사용.

### /debug

오류 발생 시 진단 -> 수정 -> 기록 풀 사이클. 단일 프롬프트가 3단계를 순차 수행.

```
사용자: /debug 동영상 업로드가 안 됨

[Phase 1 - SEARCH/MATCH/DIAGNOSE]
debug-knowledge/index.md에서 관련 이슈 검색
-> 매칭 결과 보고: 기존 이슈 #N 또는 신규

[Phase 2 - REVIEW/DESIGN/PREVENT]
매칭된 이전 수정 이력 검토
-> 수정 방안 설계 + 구현 (이전 방식이 재발했으면 다른 방법)

[Phase 3 - RECORD/INDEX/GUARD]
이슈 파일 작성/업데이트 + index.md 업데이트
-> 패턴 승격 필요 시 사용자에게 제안
```

### /debug-check

코드 작성 전/중에 관련 이슈 사전 조회. 명시적 호출만 지원 (자동 트리거 없음).

```
사용자: /debug-check app/api/upload/route.ts

1. 파일 경로 + 키워드로 debug-knowledge/ 검색
2. 관련 이슈/패턴 발견 시 경고 + 체크리스트 제시
3. 패턴 가이드가 있으면 주의사항 브리핑
```

### /debug-log

수정 완료 후 수동 기록 (자동 기록 못한 경우).

```
사용자: /debug-log 동영상 업로드 413 에러, sizeLimit 설정으로 해결

1. 이슈 파일 작성 (신규) 또는 업데이트 (기존)
2. index.md 업데이트
3. ID는 index.md 최대값 + 1로 자동 부여
```

---

## 4. 기존 시스템 통합

### CLAUDE.md 추가

워크플로우 커맨드 테이블에 /debug, /debug-check, /debug-log 추가.
에이전트 테이블에 디버깅 에이전트팀 (3명) 추가.

### 에이전트 파일 위치

공통: `.claude/agents/bug-detective.md`, `fix-architect.md`, `knowledge-keeper.md`
워크트리별로 동일하게 상속.

### 기존 워크플로우 연결

- 오류 수정 후 -> Knowledge Keeper 호출 권장
- /review (멀티에이전트 리뷰) 시 Knowledge Keeper가 알려진 이슈 피드백 추가
