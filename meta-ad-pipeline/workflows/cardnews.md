# Workflow: 카드뉴스 (Card News)

> 인스타그램 캐러셀용 7-10장 슬라이드 카드뉴스

## 입력

- 주제 (필수)
- 타겟 독자 (선택)
- 참고 자료/URL (선택)

## 파이프라인

### Step 1: 리서치 (researcher)
```
invoke: skills/01-write-research.md
input: 주제, 참고 자료
output: outputs/{project}/research.json
```

→ 🔔 **컨펌 1**: 방향성 + 제목 승인

### Step 2: 스토리보드 (copywriter)
```
invoke: skills/09-write-storyboard.md
input: research.json
output: outputs/{project}/storyboard.json
```
- 슬라이드별 구성 (표지/본문/CTA)
- 각 장별 헤드라인 + 본문 텍스트
- 전체 흐름 설계

→ 🔔 **컨펌 2**: 스토리보드 승인

### Step 3: 카피 + 비주얼 병렬 제작
```
copywriter → skills/03-write-copy.md (캡션 작성)
designer → skills/06-render-html.md (슬라이드 HTML 생성)
input: storyboard.json, design-system/
output: templates/{project}_slide_01~10.html, caption.txt
```

### Step 4: 렌더링 (developer)
```
invoke: skills/07-merge-render.md
input: 슬라이드 HTML 전체
output: outputs/images/{project}_slide_01~10.png
```

### Step 5: QA (qa-reviewer)
```
invoke: skills/08-validate-qa.md
```
- 슬라이드 간 일관성 검증
- 텍스트 오탈자 체크
- 디자인 시스템 준수 여부

→ 🔔 **컨펌 3**: 전체 슬라이드 최종 승인

## 산출물

| 파일 | 형식 | 설명 |
|------|------|------|
| slide_01~10.png | PNG 1080x1080 | 캐러셀 슬라이드 |
| slide_01~10.html | HTML | 편집 가능한 소스 |
| caption.txt | TXT | 인스타 캡션 |
| storyboard.json | JSON | 스토리보드 |
