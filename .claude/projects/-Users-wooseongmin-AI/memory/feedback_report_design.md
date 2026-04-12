---
name: 리포트 디자인 컬러 스펙
description: New Biz Prep / Post Meeting HTML 리포트의 컬러 팔레트 및 디자인 규칙
type: feedback
---

New Biz Prep, Post Meeting 등 HTML 리포트는 산뜻한 오렌지 + 클린 화이트/그레이 팔레트를 사용한다.

**Why:** 브라운/베이지는 올드하고, 빨강/초록/파랑 다색 조합은 강렬하고 지저분하다. 컬러 최소화 + 오렌지 단일 액센트가 깔끔하다.

**How to apply:**
- CSS 변수 스펙:
  - `--primary: #1a1a1a` (텍스트/다크 요소)
  - `--secondary: #444444`
  - `--accent: #f07030` (산뜻한 오렌지 — 유일한 컬러 액센트)
  - `--accent-light: #fff3ec` (오렌지 배경 연한 버전)
  - `--accent-soft: #fde8da` (오렌지 배경 약간 진한 버전)
  - `--bg: #fafafa`, `--card-bg: #ffffff`, `--muted: #f5f5f5`
  - `--text-light: #999999`, `--border: #eeeeee`
- 헤더: 화이트 배경, 오렌지 뱃지
- KPI 카드: 라이트그레이(`--muted`) 기본, 오렌지 소프트(`--accent-soft`) 강조, 오렌지(`--accent`) 핵심
- 테이블 헤더: 라이트그레이 배경 + 볼드 (검정 배경 금지)
- 태그: 오렌지 소프트 위주, 보조로 연한 그린(`#eef3ec`) 정도만
- SWOT/SPIN: 화이트 + 연한 오렌지 교대 (다색 금지)
- leverage-box: `--primary`(#1a1a1a) 다크 배경
- verdict: `--accent` 오렌지 배경
- 전체 원칙: **컬러 2개(오렌지 + 그레이)만 사용, 나머지는 명도 차이로 구분**
