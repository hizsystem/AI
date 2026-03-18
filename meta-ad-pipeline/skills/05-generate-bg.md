# Skill 05: generate-bg

> Gemini Imagen으로 배경 비주얼 생성 (텍스트 없이)

## 호출 에이전트
developer

## 프로세스
1. 비주얼 플랜에서 테마/무드 추출
2. 영문 프롬프트 작성 (반드시 "NO TEXT, NO LETTERS" 포함)
3. generate_bg.py 실행
4. 결과 확인 (텍스트 포함 시 재생성)

## 프롬프트 규칙
- 반드시 영문으로 작성
- "NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO WATERMARKS" 필수
- "purely visual, square format 1080x1080" 필수
- 구체적 분위기/색상/오브젝트 묘사

## 실행
```bash
export $(cat .env | xargs) && python3 generate_bg.py
```

## 산출물
outputs/backgrounds/{project}_bg.png
