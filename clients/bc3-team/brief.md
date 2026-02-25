# BC3팀 마스터시트 프로젝트 브리프

> 작성일: 2026-02-24
> 상태: 진행중
> 회계팀 마감: 2026-02-27

---

## 기본 정보

- **팀명**: BC3팀
- **프로젝트명**: 2026 마스터시트 시스템
- **목적**: 3팀 프로젝트 관리/재무를 위한 Google Sheets 마스터시트 자동 생성 및 관리
- **담당 에이전트**: (📑) 스프레드시트 아키텍트

---

## 회계팀 요청 사항 (마감: 2/27)

### 1. 2026년 프로젝트별 예상 매출 발생 내역
- 예상 매출 발생 시기 + 금액 (세금계산서 발행 기준)
- 프로젝트별 마스터시트에 기입, 지속 업데이트/관리

### 2. 2026년 프로젝트별 예상 지출 발생 내역
- 종료시점까지 월별 실제 지출 예상 비용
- 프로젝트별 마스터시트에 기입, 지속 업데이트/관리

---

## 마스터시트 시스템 개요

### 구조
```
[프로젝트A 마스터시트] --+
[프로젝트B 마스터시트] --+--> [팀 총괄 마스터시트]
[프로젝트C 마스터시트] --+
```

### 프로젝트 마스터시트 (프로젝트당 1개, 3탭 구조)
> TASK 관리는 노션에서 통합 관리. 내부용 마스터시트는 재무 데이터에 집중.

| 탭 | 내용 |
|----|------|
| 종합-요약-색인 | 프로젝트 개요, 핵심 수치 요약 |
| 2026 예상 매출 | 세금계산서 기준 월별 매출 |
| 2026 예상 지출 | 카테고리별(인건비/외주비/광고비/툴비용/기타) 월별 지출 |

### 팀 총괄 마스터시트 (1개)
| 탭 | 내용 |
|----|------|
| 대시보드 | 팀별 프로젝트 현황, 월별 수익 요약 |
| 프로젝트별 월별 총지출 | IMPORTRANGE로 자동 집계 |
| 팀 전체 월별 총지출 | 카테고리별 합산 |
| 월별 수익 | 매출 - 지출, 누적 수익 |

---

## 기술 스택

| 항목 | 선택 |
|------|------|
| API | Python `gspread` + `google-auth` |
| 인증 | Google Service Account (GCP) |
| 시트 간 연동 | IMPORTRANGE 수식 |

---

## 핵심 스크립트

| 스크립트 | 용도 | 실행 예시 |
|---------|------|----------|
| `scripts/create_project_sheet.py` | 프로젝트 마스터시트 생성 | `python3 scripts/create_project_sheet.py --name "프로젝트명" --team "BC3팀" --share "email"` |
| `scripts/create_team_summary_sheet.py` | 팀 총괄 시트 생성 | `python3 scripts/create_team_summary_sheet.py --share "email"` |
| `scripts/link_sheets.py` | 프로젝트-총괄 IMPORTRANGE 연동 | `python3 scripts/link_sheets.py --project-url "URL" --summary-url "URL" --team "BC3팀" --row N` |

---

## 작업 순서

1. [ ] GCP Service Account 설정 (`.secrets/gcp-service-account.json`)
2. [ ] Python 의존성 설치 (`pip3 install -r scripts/requirements.txt`)
3. [ ] 프로젝트별 마스터시트 생성
4. [ ] 팀 총괄 마스터시트 생성
5. [ ] IMPORTRANGE 연동 설정
6. [ ] 매출/지출 데이터 입력
7. [ ] 회계팀에 총괄 시트 URL 공유 (마감: 2/27)

---

## 참고 문서

- 설계서: `docs/plans/2026-02-23-mastersheet-design.md`
- 구현 계획: `docs/plans/2026-02-23-mastersheet-implementation.md`
- 에이전트: `.claude/agents/spreadsheet-architect.md`
