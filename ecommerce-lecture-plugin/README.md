# 이커머스 강의 슬라이드 — Figma 플러그인

핸드오프 문서 기반 16장 프레젠테이션 자동 생성.

## 사용법

### 1. Figma에서 새 파일 열기

### 2. 플러그인 로드
1. **Plugins** → **Development** → **Import plugin from manifest...**
2. 이 폴더의 `manifest.json` 선택
3. **Plugins** → **Development** → **이커머스 강의 슬라이드 생성기** 실행

### 3. 실행 결과
- 16개 프레임 (1920×1080) 자동 생성
- 컬러/타이포/레이아웃 핸드오프 문서 그대로 적용
- 사진 영역은 dashed placeholder → 이미지 교체만 하면 됨

## 사진 교체 체크리스트

| 슬라이드 | 이미지 | 사이즈 |
|---------|--------|--------|
| 05 | 리솔츠 자사몰 or 제품 | 500×260 |
| 07 | Teaforest 향수 | 400×200 |
| 11 | GA4 퍼널 분석 | 700×160 |
| 13 | CRM 관련 캡처 | 720×140 |

## 폰트 요구사항
- **Noto Sans KR** (Light, Regular, Medium, Bold, Black)
- Google Fonts에서 설치 필요

## 파일 구조
```
ecommerce-lecture-plugin/
├── manifest.json   # Figma 플러그인 매니페스트
├── code.js         # 슬라이드 생성 로직 (16장)
└── README.md       # 이 파일
```
