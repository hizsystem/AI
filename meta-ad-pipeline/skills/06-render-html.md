# Skill 06: render-html

> HTML/CSS 슬라이드 생성

## 호출 에이전트
designer

## 프로세스
1. 비주얼 플랜 + 카피 결합
2. design-system/base.css 참조
3. HTML/CSS 슬라이드 작성 (1080x1080)
4. 제품 사진 임베드 (../assets/ 경로)
5. Pretendard 폰트 CDN 링크 포함

## HTML 구조 규칙
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="Pretendard CDN">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1080px; overflow: hidden; }
    .slide { width: 1080px; height: 1080px; position: relative; }
    .logo { position: absolute; top: 40px; right: 48px; }
    .cta-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 80px; }
  </style>
</head>
<body>
  <div class="slide">
    <div class="logo">brandrise</div>
    <div class="content">...</div>
    <div class="cta-bar">CTA 문구 →</div>
  </div>
</body>
</html>
```

## 산출물
templates/{project}.html
