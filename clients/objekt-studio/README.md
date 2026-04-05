# Objekt Studio

AI 기반 포토그래퍼 포트폴리오 인스타그램 계정.
브랜드를 해석하는 감각과 감도를 보여주어, 실제 브랜드로부터 촬영 제의를 받는 것이 목표.

## Account

- **Handle**: @objekt.studio
- **Concept**: "The Brand Lens" — 주간 브랜드 프로젝트 + 데일리 오브제
- **Category**: 라이프스타일 오브제 전반 (뷰티, F&B 패키징, 리빙, 패션 소품)

## Weekly Rhythm

| 요일 | 포맷 | 설명 |
|------|------|------|
| 월 | Brand Set (캐러셀 3-5장) | 브랜드 해석 프로젝트 |
| 수 | Daily Object (싱글 1장) | 오브제 단독 샷 |
| 금 | Daily Object (싱글 1장) | 오브제 단독 샷 |

## Pipeline

```
[1] Brand Research → [2] Visual Creation → [3] QC & Curation → [4] Publish
     Claude 자동        AI 이미지 생성         수동 (핵심)        수동 → 자동화
```

## Current Phase

**Phase 0: Visual Calibration** — 툴 탐색, 비주얼 기준 확립, 첫 콘텐츠 제작

## Daily Operation SOP

### Brand Set 제작 (월요일 발행용)

1. 브랜드 큐에서 이번 주 브랜드 확인
2. Claude에게 Brand Research Brief 요청
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

## Folder Structure

```
identity/          — 계정 아이덴티티 & 비주얼 톤 가이드
templates/         — 브리프, 프롬프트, 캡션, QC 템플릿
calibration/       — Phase 0 결과물 (툴 비교, 레퍼런스, 핀 세션)
brands/            — 브랜드별 작업 폴더
content/           — 발행 콘텐츠 아카이브
queue/             — 주간 브랜드 큐
```

## References

- Spec: `docs/superpowers/specs/2026-03-19-objekt-studio-design.md`
- Plan: `docs/superpowers/plans/2026-03-19-objekt-studio.md`
