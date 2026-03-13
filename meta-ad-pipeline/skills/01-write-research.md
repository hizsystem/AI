# Skill 01: write-research

> 주제에 대한 리서치를 수행하고 구조화된 JSON으로 반환

## 호출 에이전트
researcher

## 프로세스
1. 주제 키워드로 WebSearch 수행 (3-5회)
2. context/sales-plan.md에서 관련 사례 추출
3. 경쟁사 광고 소재 분석 (가능한 경우)
4. 타겟 페인포인트 + 추천 앵글 도출

## 입력
- topic: string
- context_files: string[] (optional)

## 산출물
outputs/{project}/research.json
