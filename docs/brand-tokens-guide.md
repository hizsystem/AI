# 멀티 브랜드 토큰 가이드

Figma Variables + Extended Collections를 활용한 멀티 브랜드 토큰 관리 체계.

## 토큰 3계층 구조

```
1. Brand Tokens (브랜드 고유값)
   예: brandrise-orange: #FF9500
       goventure-blue: #2B5BA0

2. Alias Tokens (의미 부여)
   예: color-primary: {brand-token}
       color-secondary: {brand-token}
       color-background: {brand-token}
       color-text: {brand-token}

3. Component Tokens (컴포넌트 적용)
   예: card-bg: {color-background}
       card-title: {color-text}
       cta-bg: {color-primary}
       cta-text: #FFFFFF
```

## 클라이언트별 브랜드 토큰

### 고벤처포럼
| 토큰 | 값 | 용도 |
|------|-----|------|
| color-primary | (추출 필요) | 메인 브랜드 컬러 |
| color-secondary | (추출 필요) | 서브 컬러 |
| color-background | (추출 필요) | 배경 |
| font-primary | (추출 필요) | 메인 폰트 |
| instagram-handle | @goventureforum | 인스타 핸들 |

### 브랜드라이즈
| 토큰 | 값 | 용도 |
|------|-----|------|
| color-primary | #FF9500 | 메인 브랜드 오렌지 |
| color-secondary | (추출 필요) | 서브 컬러 |
| color-background | (추출 필요) | 배경 |
| font-primary | (추출 필요) | 메인 폰트 |
| instagram-handle | @brandrise_kr | 인스타 핸들 |

### 탭샵바
| 토큰 | 값 | 용도 |
|------|-----|------|
| color-primary | (추출 필요) | 메인 브랜드 컬러 |
| color-secondary | (추출 필요) | 서브 컬러 |
| font-primary | (추출 필요) | 메인 폰트 |
| instagram-handle | (미정) | 인스타 핸들 |

### 휴닉 (HUENIC)
| 토큰 | 값 | 용도 |
|------|-----|------|
| color-primary | (추출 필요) | 메인 브랜드 컬러 |
| color-secondary | (추출 필요) | 서브 컬러 |
| font-primary | (추출 필요) | 메인 폰트 |
| sub-brand-veggiet | (추출 필요) | 베지어트 브랜드 컬러 |
| sub-brand-vinker | (추출 필요) | 빈커 브랜드 컬러 |
| instagram-handle | (미정) | 인스타 핸들 |

## Figma Variables 설정 방법

### Step 1: Collection 생성
1. Figma 파일 열기
2. 우측 패널 > Local variables > + 클릭
3. Collection 이름: "Brand Tokens"

### Step 2: Mode 설정 (멀티 브랜드)
1. Collection 내에서 + 버튼으로 Mode 추가
2. Mode 이름을 클라이언트명으로 설정
   - Mode 1: 고벤처포럼
   - Mode 2: 브랜드라이즈
   - Mode 3: 탭샵바
   - Mode 4: 휴닉

### Step 3: 변수 생성
1. + 버튼으로 변수 추가
2. 타입 선택 (Color, Number, String, Boolean)
3. 각 Mode별 값 입력

### Step 4: 적용
1. 프레임/컴포넌트 선택
2. 속성 (Fill, Stroke, Text 등)에서 변수 아이콘 클릭
3. 해당 변수 연결

## Extended Collections (Pro 플랜)

```
Core Collection (공통)
├── spacing-xs: 4
├── spacing-sm: 8
├── spacing-md: 16
├── spacing-lg: 24
├── spacing-xl: 32
├── radius-sm: 4
├── radius-md: 8
├── radius-lg: 16
└── font-size-*: ...

Brand Collection (클라이언트별 Mode)
├── color-primary: Mode별 다른 값
├── color-secondary: Mode별 다른 값
├── color-background: Mode별 다른 값
├── color-text: Mode별 다른 값
└── font-primary: Mode별 다른 값
```

## 토큰 추출 프로세스

1. Figma 파일에서 특정 노드 선택
2. MCP `get_variable_defs`로 적용된 변수 조회
3. `exports/tokens/` 에 JSON/CSS 형태로 저장
4. 코드 프로젝트에서 참조

### 추출 결과 형식 (JSON)
```json
{
  "brand": "brandrise",
  "tokens": {
    "color": {
      "primary": "#FF9500",
      "secondary": "#...",
      "background": "#...",
      "text": "#..."
    },
    "typography": {
      "primary": "...",
      "heading-size": "...",
      "body-size": "..."
    },
    "spacing": {
      "xs": 4,
      "sm": 8,
      "md": 16
    }
  }
}
```
