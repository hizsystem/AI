# Workflow: 인스타그램 콘텐츠 (Instagram)

> 인스타 피드용 단일/멀티 이미지 콘텐츠

## 입력

- 주제/메시지 (필수)
- 콘텐츠 유형: 정보형 / 후기형 / 프로모션 (선택)
- 참고 이미지 (선택)

## 파이프라인

### Step 1: 콘텐츠 기획 (copywriter)
```
invoke: skills/02-plan-content.md
input: 주제, context/sales-plan.md
output: outputs/{project}/content-plan.json
```

→ 🔔 **컨펌 1**: 콘텐츠 방향 승인

### Step 2: 카피 + 비주얼 (copywriter → designer)
```
invoke: skills/03-write-copy.md → skills/06-render-html.md
output: templates/{project}.html, caption.txt
```

### Step 3: 렌더링 + QA (developer → qa-reviewer)
```
invoke: skills/07-merge-render.md → skills/08-validate-qa.md
output: outputs/images/{project}_final.png
```

→ 🔔 **컨펌 2**: 최종 승인

## 산출물

| 파일 | 형식 | 설명 |
|------|------|------|
| {project}_final.png | PNG 1080x1080 | 인스타 피드 이미지 |
| caption.txt | TXT | 캡션 + 해시태그 30개 |
