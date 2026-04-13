---
name: generate-image
description: Gemini AI 이미지 생성. 광고 배경, 제품 사진, 소셜 비주얼 등.
triggers:
  - "이미지 생성"
  - "배경 만들어"
  - "비주얼 생성"
  - "이미지 만들어"
  - "generate image"
---

# AI 이미지 생성 스킬

Gemini Imagen을 사용하여 마케팅용 이미지를 생성하는 스킬.

## 필수 설정

```bash
export GEMINI_API_KEY=your_key_here
```
API 키 발급: https://aistudio.google.com/apikey

## 실행 흐름

### 1단계: 요청 확인

사용자에게 확인:
- **용도**: 광고 배경 / 제품 사진 / SNS 비주얼 / 카드뉴스 배경 / 기타
- **스타일**: 미니멀 / 럭셔리 / 따뜻한 / 전문적 / 기타
- **사이즈**: 1080x1080(인스타) / 1920x1080(유튜브) / 1080x1920(릴스/스토리)
- **특별 요청**: 컬러, 무드, 참고 이미지 등

### 2단계: 프롬프트 작성

영어 프롬프트를 작성한다 (Gemini는 영어 프롬프트가 더 정확):
- 구체적인 비주얼 요소 나열
- 컬러 팔레트 지정
- "NO TEXT, NO LETTERS, NO WORDS, NO WATERMARKS" 필수 포함
- 사이즈 명시

### 3단계: 이미지 생성

```bash
python3 scripts/generate-image.py "프롬프트" output.png
```

### 4단계: 결과 확인 + 재생성

- 생성된 이미지 경로 전달
- 불만족 시 프롬프트 수정 후 재생성

## 용도별 프롬프트 템플릿

**광고 배경:**
```
Professional {style} background, {color} gradient,
subtle bokeh light, clean aesthetic, {mood} mood,
NO TEXT, NO LETTERS, NO WORDS, square format {size}
```

**제품 사진 배경:**
```
Clean product showcase background, {color} surface,
soft studio lighting, minimalist, premium feel,
NO TEXT, NO LETTERS, NO WORDS, {size}
```

**SNS 비주얼:**
```
{style} social media visual, {theme} theme,
eye-catching composition, trendy aesthetic,
NO TEXT, NO LETTERS, NO WORDS, {size}
```

## 산출물 저장

```
clients/{client-name}/content/images/
└── YYYY-MM-DD-{description}.png
```

## 다른 스킬과 연계

- `/content` 완료 후 → "비주얼 만들어줘" → 이 스킬 호출
- `/campaign` 완료 후 → 광고 소재 배경 생성
- `/viral-plan` 완료 후 → 썸네일/커버 이미지 생성
