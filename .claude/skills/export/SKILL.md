---
name: export
description: 산출물을 PDF/PPTX로 변환. 제안서, 보고서 등 클라이언트 전달용 포맷 생성.
triggers:
  - "PDF로"
  - "PPTX로"
  - "파일로 뽑아"
  - "내보내기"
  - "export"
  - "변환해"
---

# 산출물 Export 스킬

마크다운/HTML 산출물을 클라이언트 전달용 포맷(PDF, PPTX)으로 변환하는 스킬.

## 사용 가능한 포맷

| 포맷 | 입력 | 도구 | 명령어 |
|------|------|------|--------|
| **PDF** | HTML 파일 또는 URL | Puppeteer | `node scripts/export-to-pdf.mjs <input> [output]` |
| **PPTX** | 마크다운 파일 | python-pptx | `python3 scripts/export-to-pptx.py <input> [output] [--theme light\|dark\|brand]` |
| **HTML** | 데이터 + 템플릿 | 직접 생성 | 템플릿 기반 HTML 작성 후 저장 |

## 실행 흐름

### 1단계: 변환 대상 확인

사용자에게 확인:
- **변환할 파일**: 어떤 산출물을 변환할 것인가 (파일 경로 또는 방금 생성한 산출물)
- **출력 포맷**: PDF / PPTX / HTML
- **테마** (PPTX인 경우): light(기본) / dark / brand

### 2단계: 포맷별 분기 실행

**PDF 변환:**
1. 대상이 마크다운이면 → 먼저 HTML로 변환 (인라인 CSS 포함)
2. HTML 파일을 `scripts/export-to-pdf.mjs`로 변환
3. 결과 PDF 경로 반환

**PPTX 변환:**
1. 대상이 마크다운이면 → 바로 `scripts/export-to-pptx.py`로 변환
2. `#` = 타이틀 슬라이드, `##` = 섹션 슬라이드, `-` = 불릿으로 자동 변환
3. 결과 PPTX 경로 반환

**HTML 보고서:**
1. 기존 `mosu-report` 스킬의 템플릿 패턴 참조
2. 데이터를 HTML 템플릿에 주입하여 파일 생성
3. GitHub Pages 배포 가능

### 3단계: 산출물 저장

변환된 파일은 원본과 같은 폴더에 저장:
```
clients/{client-name}/proposals/2026-04-13-proposal.md   (원본)
clients/{client-name}/proposals/2026-04-13-proposal.pdf   (변환)
clients/{client-name}/proposals/2026-04-13-proposal.pptx  (변환)
```

## 마크다운 → PDF 중간 변환 가이드

마크다운을 PDF로 직접 변환할 수 없으므로, 먼저 HTML로 변환한다.
HTML 생성 시 인라인 CSS를 포함하여 독립 실행 가능한 파일로 만든다.

기본 HTML 템플릿 스타일:
- A4 사이즈 (`max-width: 210mm`)
- 프린트 최적화 CSS (`@media print`)
- 한글 폰트 지원 (`Pretendard, -apple-system`)
- 표, 리스트, 코드블록 스타일 포함

## PPTX 테마 가이드

| 테마 | 배경 | 텍스트 | 강조색 | 용도 |
|------|------|--------|--------|------|
| `light` | 흰색 | 검정 | 파랑 | 일반 제안서, 보고서 |
| `dark` | 다크 그레이 | 흰색 | 하늘색 | 발표용, 임원 보고 |
| `brand` | 크림 | 검정 | 오렌지 | MarketingOS 브랜드 |

## 다른 스킬과 연계

- `/proposal` 완료 후 → "PPTX로 뽑아줘" → 이 스킬 자동 호출
- `/report` 완료 후 → "PDF로 내보내줘" → 이 스킬 자동 호출
- `/content` 완료 후 → 필요시 HTML 카드형으로 변환 가능
