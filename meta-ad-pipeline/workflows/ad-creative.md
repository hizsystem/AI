# Workflow: 광고 소재 (Ad Creative)

> 메타/인스타 광고용 싱글 이미지 소재 제작

## 입력

- 주제/클라이언트명 (필수)
- 제품 사진 경로 (선택)
- 참고 카피/방향성 (선택)

## 파이프라인

### Step 1: 리서치 (researcher)
```
invoke: skills/01-write-research.md
input: 주제, context/sales-plan.md
output: outputs/{project}/research.json
```
- 브랜드 정보 수집
- 경쟁사 광고 소재 분석
- 타겟 페인포인트 정리

→ 🔔 **컨펌 1**: 리서치 결과 + 광고 방향성 승인

### Step 2: 카피 작성 (copywriter)
```
invoke: skills/03-write-copy.md
input: research.json, feedback/feedback.md
output: outputs/{project}/copy.json
```
- 카피 3안 제작 (각각 다른 접근)
- 헤드라인 + 서브카피 + CTA
- 인스타 캡션 + 해시태그

→ 🔔 **컨펌 2**: 카피 시안 선택

### Step 3: 비주얼 설계 (designer)
```
invoke: skills/04-plan-visual.md → skills/06-render-html.md
input: 선택된 카피, design-system/tokens.json, assets/
output: templates/{project}.html
```
- 레이아웃 설계 (1080x1080)
- HTML/CSS 슬라이드 생성
- 제품 사진 배치

### Step 4: 배경 생성 + 합성 (developer)
```
invoke: skills/05-generate-bg.md → skills/07-merge-render.md
input: templates/{project}.html, design-system/
output: outputs/images/{project}_final.png
```
- Gemini Imagen 배경 생성 (텍스트 없이)
- HTML + 배경 합성
- Playwright PNG 렌더링

### Step 5: QA 검증 (qa-reviewer)
```
invoke: skills/08-validate-qa.md
input: outputs/images/{project}_final.png, templates/{project}.html
output: outputs/{project}/qa-report.json
```
- 텍스트 가독성 확인
- 해상도/크기 검증 (1080x1080)
- 브랜드 가이드 일치 여부
- CTA 존재 여부

→ 🔔 **컨펌 3**: 최종 PNG 승인

## 산출물

| 파일 | 형식 | 설명 |
|------|------|------|
| {project}_final.png | PNG 1080x1080 | 메타 광고용 최종 이미지 |
| {project}.html | HTML | 편집 가능한 소스 |
| caption.txt | TXT | 인스타 캡션 + 해시태그 |
| qa-report.json | JSON | QA 검증 결과 |
