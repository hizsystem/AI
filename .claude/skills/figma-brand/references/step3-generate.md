# Step 3: HTML 브랜드 가이드 생성

brand-analysis.md의 분석 결과를 기반으로 HTML 브랜드 가이드를 생성한다.

## 기본 규칙

1. `templates/brand-guide.html`의 구조를 기반으로 한다
2. **모든 텍스트 요소에 인라인 `style="color:#XXXXXX"` 을 반드시 적용한다** (Figma 캡처 호환)
3. 외부 폰트는 Bricolage Grotesque만 Google Fonts로 로드한다
4. 한글은 시스템 폰트(`-apple-system, sans-serif`)로 렌더링한다 (Figma에서 Inter로 교체됨)
5. Figma 캡처 스크립트를 `<head>`에 포함한다:
   ```html
   <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
   ```
6. 페이지 너비는 1200px 고정

## 필수 섹션 (항상 포함)

### 1. Cover
- 브랜드 Primary 컬러 배경
- 영문 브랜드명 (Bricolage Grotesque Bold)
- "Brand Guidelines" 라벨
- 연도

### 2. Brand Identity
- 키워드 태그 (pill 형태, Primary 배경 + 흰색 텍스트)
- 영문 태그라인 (outline pill)
- Mission / Personality / Promise 3칸 카드

### 3. Brand Colors
- 3x2 그리드 컬러 카드 (베지어트 구조)
- 각 카드: 컬러 스워치 + 이름 + 역할(PRIMARY/SECONDARY/NEUTRAL) + CMYK + RGB + HEX
- Product Series Color Guide: 제품별 2컬러 바 페어링

### 4. Typefaces
- 테이블 구조: Logo / English Title / Title / Body Bold / Body
- 각 행: 역할 라벨 + 폰트명 + 샘플 텍스트 + 설명

### 5. Logo Usage Rules
- 2x2 그리드: Clear Space / Minimum Size / Light Background / Dark Background
- 각 카드: 라벨 + 설명 텍스트

### 6. Tone of Voice
- Do / Don't 2칸 카드
- Do: 녹색 배경 (#F0F9F1), 녹색 태그
- Don't: 빨간 배경 (#FEF2F2), 빨간 태그
- 각 6개 예시 문장

## 선택 섹션 (자동 판단)

### 7. Product Naming (제품 3개+ & 패턴 있을 때)
- 3열 그리드: 제품명 + 설명 + 네이밍 패턴 태그

### 8. Photography Style (인스타 스크린샷 있을 때)
- 2x2 촬영 유형 카드 (비주얼 영역 + 제목 + 설명)
- Signature Props 칩 (아이콘 + 이름 + 역할)

### 9. Instagram Grid Rules (인스타 스크린샷 있을 때)
- 3x3 목업 그리드 (따뜻한 톤 / 밝은 톤 / 네이비 교차)
- 3열 규칙 카드 (번호 + 제목 + 설명)

### 10. Package Specs (제품 2개+ & 물리적 제품일 때)
- 3열 그리드: 컬러 서클 + 제품명 + 제형 + 수량

## 텍스트 컬러 가이드 (인라인 스타일)

| 역할 | 컬러 | 적용 대상 |
|------|------|---------|
| 섹션 라벨 | #999999 | BRAND ESSENCE, COLOR SYSTEM 등 |
| 섹션 제목 | #1A1A1A | Brand Identity, Brand Colors 등 |
| 카드 제목 | #1A1A1A | Weetamin Navy, Mission 등 |
| 카드 역할/라벨 | #999999 | PRIMARY, SECONDARY 등 |
| 본문 텍스트 | #666666 | 설명, CMYK/RGB/HEX 스펙 |
| 보조 텍스트 | #999999 | 부가 설명, 캡션 |
| 네이비 배경 위 텍스트 | #FFFFFF | 커버, 키워드 태그, 브랜드 카드 |
| Do/Don't 본문 | #333333 | 톤앤보이스 카드 내부 |

## Footer
- Primary 컬러 배경
- 브랜드명 (Bricolage Grotesque, 흰색)
- "Brand Guidelines — Prepared by BRANDRISE | {연도}" (흰색 40% opacity)

## 산출물
`clients/{brand}/brand-guide.html`에 저장한다.
