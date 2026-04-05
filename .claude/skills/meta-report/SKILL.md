---
name: meta-report
description: Meta 광고 성과 보고서 생성. 일간/주간/월간, 내부/클라이언트용.
triggers:
  - "메타 리포트"
  - "meta report"
  - "메타 성과"
  - "광고 보고서"
---

# Meta 성과 보고서

광고 데이터를 분석하고 보고서를 생성하는 스킬.

## 실행 흐름

### 1단계: 보고서 유형 선택
- 일간 / 주간 / 월간
- 내부용 / 클라이언트용

### 2단계: 데이터 수집
마스터시트에서 데이터 가져오기:
- Meta Ads 탭: 광고 성과 지표
- Content Tracker 탭: 오가닉 성과
- 상담신청 내역 탭: 전환 데이터

### 3단계: 분석
meta-growth-analyst 에이전트가 분석:
- 핵심 지표 변화 (전기 대비)
- 퍼널 전환율
- 소재별 성과 비교
- 인사이트 도출

### 4단계: 보고서 작성
meta-account-manager 에이전트가 보고서 포맷팅:
- 클라이언트용: 쉬운 용어, 핵심만
- 내부용: 상세 데이터, 기술적 분석

### 산출물 저장
```
clients/{client-name}/meta/reports/YYYY-MM-DD-{type}.md
```
