---
name: mosu-report
description: 모수 프로젝트 주간 보고서 생성. HTML 보고서 자동 생성 + GitHub Pages 배포.
triggers:
  - "모수 보고"
  - "mosu report"
  - "모수 리포트"
  - "주간 보고"
  - "모수 주간"
---

# 모수 프로젝트 주간 보고서

부회장님 보고용 HTML 보고서를 생성하고 GitHub Pages에 배포하는 스킬.

## 보고서 스타일

- **핵심만, 심플하게** — 부회장님은 핵심만 말하는 걸 중요시함
- **시각적 구조** — 깔때기 퍼널, KPI 카드, 우선순위 박스
- **숫자 → 해석 → 액션** 순서
- ReSaltZ 스타일 카드 레이아웃 (다크 네비바 + 화이트 카드)

## 실행 흐름

### 1단계: 기본 정보 수집

사용자에게 질문:
- 보고 기간 (예: 4/10~4/16)
- 주차 (W1, W2, W3...)

### 2단계: 성과 데이터 수집

사용자에게 질문 (스크린샷이나 숫자 모두 OK):

**Meta 광고 데이터:**
- 노출수, 클릭수, CPC, CTR
- 지출 금액

**퍼널 데이터:**
- 진단 페이지 유입 수
- 진단 완료 수
- 상담 신청 수
- 수주 건수

**채널별 유입:** (UTM 기반)
- Meta 광고: N건
- 블로그+브런치+쓰레드: N건
- 고벤처포럼: N건
- 기타: N건

### 3단계: 정성 정보 수집

사용자에게 질문:
- 이번 주 특이사항 / 인사이트 (잘된 것, 안된 것, 발견한 것)
- 다음 주 핵심 액션 (2-3개)
- 이슈 / 요청 사항 (있으면)

### 4단계: HTML 보고서 생성

템플릿 파일: `templates/mosu-weekly.html`

이 템플릿을 기반으로 수집한 데이터를 반영하여 HTML 파일을 생성한다.

**파일 생성 위치:**
```
clients/brandrise/reports/mosu-weekly-{YYYYMMDD}.html
```

**생성 규칙:**
- 템플릿의 `{{변수명}}` 플레이스홀더를 실제 데이터로 교체
- 데이터가 없는 섹션은 "데이터 수집 중" 표시 또는 해당 섹션 제거
- 인사이트는 info-box / success-box / highlight-box / risk-box 중 적절한 스타일 적용
  - 잘된 것 → success-box
  - 주의사항 → highlight-box
  - 리스크 → risk-box
  - 일반 정보 → info-box
- 다음 주 액션은 priority-box에 priority-item으로 구성 (최대 3개)

### 5단계: GitHub Pages 배포

```bash
cd /tmp/reports && git pull origin main
cp {생성된 HTML} /tmp/reports/
cd /tmp/reports && git add . && git commit -m "report: 모수 W{N} 주간 보고 ({날짜})" && git push origin main
```

배포 완료 후 URL 반환:
```
https://hizsystem.github.io/reports/mosu-weekly-{YYYYMMDD}.html
```

### 6단계: 보고 스크립트 생성 (선택)

사용자가 원하면 2-3분 분량의 보고 스크립트도 함께 생성.
부회장님 스타일: 핵심만, 짧게, 나머지는 질문 시간.

## 보고서 구조 (섹션)

1. **핵심 지표** — KPI 4개 카드 (진단 유입 / 진단 완료 / 상담 전환 / 수주)
2. **퍼널 현황** — 세로 깔때기 + 각 단계 숫자 + 전환율
3. **채널별 성과** — 테이블 (채널 / 유입 / 진단 완료 / 상담 전환 / CPA)
4. **이번 주 인사이트** — 잘된 것, 개선 필요, 발견점
5. **다음 주 핵심 액션** — 우선순위 박스 (최대 3개)

## 누적 데이터

매 보고서 생성 시 이전 보고서 데이터를 참조하여 누적 수치를 계산한다.
이전 보고서 위치: `clients/brandrise/reports/` 내 가장 최근 파일.

## 참고

- 배포 repo: hizsystem/reports (GitHub Pages)
- 첫 보고서 (전략 보고): mosu-weekly-20260410.html
- 모수 프로젝트 상세 계획: clients/brandrise/mosu-project-plan.md
