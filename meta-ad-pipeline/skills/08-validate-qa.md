# Skill 08: validate-qa

> 최종 산출물 QA 검증

## 호출 에이전트
qa-reviewer

## 프로세스
1. validate_slide.py 실행
2. 체크리스트 항목별 검증
3. QA 리포트 JSON 생성
4. score 80점 미만 → FAIL, 수정 요청

## 실행
```bash
python3 tools/validate_slide.py outputs/images/{project}_final.png
```

## 체크리스트
- 캔버스: 1080x1080
- 파일 크기: < 5MB
- brandrise 로고: 존재
- CTA 바: 존재
- 텍스트: 깨짐 없음
- 디자인 시스템: 색상 일치

## 산출물
outputs/{project}/qa-report.json
