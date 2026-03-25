---
name: figma-brand
description: 브랜드 가이드라인을 자동 생성하여 Figma에 납품. 로고+웹사이트+인스타만으로 컬러/폰트/무드/톤 체계를 역설계.
---

# /figma-brand {브랜드명}

스몰브랜드를 위한 피그마 브랜드 가이드 자동 생성 스킬.
브랜드 가이드가 없는 클라이언트에게 역설계 기반 가이드를 만들어 피그마에 납품한다.

## 전체 워크플로우

```
/figma-brand {브랜드명}
    │
    ▼
Step 1. 자료 수집 (대화형)
    │   references/step1-collect.md 참조
    ▼
Step 2. 웹 리서치 + 브랜드 분석
    │   references/step2-research.md 참조
    │   → clients/{brand}/brand-analysis.md 저장
    ▼
Step 3. HTML 브랜드 가이드 생성
    │   references/step3-generate.md 참조
    │   templates/brand-guide.html 기반
    │   → clients/{brand}/brand-guide.html 저장
    ▼
Step 4. Figma 캡처 + 후처리
    │   references/step4-capture.md 참조
    │   generate_figma_design → use_figma 폰트 교체
    ▼
Step 5. 납품
    │   references/step5-deliver.md 참조
    │   피그마 URL + 파일 경로 전달
    ▼
  완료
```

## 실행 규칙

1. 각 Step의 references 파일을 반드시 읽고 따른다
2. Step 1에서 자료를 하나씩 대화형으로 수집한다 (한 번에 여러 개 묻지 않는다)
3. Step 2에서 웹 리서치 결과를 brand-analysis.md에 저장한다
4. Step 3에서 HTML 생성 시 모든 텍스트에 인라인 style="color:..." 을 반드시 적용한다
5. Step 4에서 Figma 캡처 후 use_figma로 missing font를 Inter로 일괄 교체한다
6. 선택 섹션(6~10)은 수집된 자료 기반으로 자동 판단한다

## 선택 섹션 자동 판단 기준

| 섹션 | 포함 조건 |
|------|---------|
| Tone of Voice | 항상 포함 |
| Product Naming | 제품 3개 이상 + 네이밍 패턴 존재 |
| Photography Style | 인스타그램 스크린샷 제공됨 |
| Instagram Grid Rules | 인스타그램 스크린샷 제공됨 |
| Package Specs | 제품 2개 이상 + 물리적 제품 |

## 산출물

| 파일 | 위치 | 용도 |
|------|------|------|
| brand-analysis.md | clients/{brand}/ | 브랜드 분석 문서 (내부용) |
| brand-guide.html | clients/{brand}/ | HTML 백업 |
| Figma 페이지 | 클라이언트 피그마 파일 | 최종 납품물 |
