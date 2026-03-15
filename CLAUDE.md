# Figma Studio

MarketingOS의 Figma 전용 워크스페이스. 클라이언트 브랜드 에셋 관리, 마케팅 소재 생산, 디자인-코드 연동을 담당한다.

## Figma 계정 정보

- Email: hizpeople@hizpeople.com
- Handle: Team HIZ
- Plan: Pro (Full seat)

## 에이전트 팀 (4명)

| 에이전트 | 역할 |
|---------|------|
| (art) 디자인 디렉터 | Figma 파일 구조 관리, 브랜드 일관성 감독, 디자인 리뷰 |
| (img) 에셋 프로듀서 | SNS/광고 소재 생성, 템플릿 관리, Figma Buzz 활용 |
| (var) 토큰 매니저 | 컬러/타이포/간격 토큰 추출, 디자인 시스템 관리, Extended Collections |
| (dev) Code Connect 엔지니어 | Figma 컴포넌트 <-> 프론트엔드 코드 매핑, MCP 연동 |

## 워크플로우 커맨드

| 커맨드 | 용도 |
|--------|------|
| `/figma-read` | Figma URL에서 디자인 읽기 (get_design_context) |
| `/figma-screenshot` | 특정 노드 스크린샷 캡처 |
| `/figma-tokens` | 디자인 변수/토큰 추출 |
| `/figma-generate` | Figma에 디자인 생성 |
| `/figma-diagram` | FigJam에 다이어그램 생성 |
| `/figma-brand` | AI 브랜드 가이드라인 생성 |
| `/figma-code-connect` | 컴포넌트-코드 매핑 관리 |
| `/figma-export` | 에셋 내보내기 (토큰, 이미지, 코드) |

## MCP 도구 매핑

| 작업 | MCP 도구 | 에이전트 |
|------|---------|---------|
| 디자인 읽기/코드 변환 | `get_design_context` | 디자인 디렉터, Code Connect 엔지니어 |
| 스크린샷 | `get_screenshot` | 에셋 프로듀서 |
| 메타데이터 조회 | `get_metadata` | 디자인 디렉터 |
| 디자인 변수 추출 | `get_variable_defs` | 토큰 매니저 |
| 디자인 생성 | `generate_figma_design` | 에셋 프로듀서, 디자인 디렉터 |
| FigJam 다이어그램 | `generate_diagram` | 디자인 디렉터 |
| FigJam 읽기 | `get_figjam` | 디자인 디렉터 |
| Code Connect 매핑 | `add_code_connect_map`, `get_code_connect_map` | Code Connect 엔지니어 |
| Code Connect 제안 | `get_code_connect_suggestions` | Code Connect 엔지니어 |
| 디자인 시스템 규칙 | `create_design_system_rules` | 토큰 매니저 |

## 디렉토리 구조

```
figma-studio/
├── CLAUDE.md              # 이 파일
├── brand-assets/          # 클라이언트별 브랜드 에셋 매핑
│   └── {client-name}/
│       ├── figma-links.md # Figma 파일 URL 모음
│       ├── tokens.json    # 추출된 디자인 토큰
│       └── guidelines.md  # 브랜드 가이드라인
├── templates/             # 재사용 템플릿
│   ├── social/            # SNS 템플릿 (Instagram, Facebook, LinkedIn)
│   ├── ads/               # 광고 소재 템플릿
│   └── presentation/      # 프레젠테이션 템플릿
├── code-connect/          # Figma <-> 코드 컴포넌트 매핑
│   └── mappings.json      # Code Connect 매핑 설정
├── exports/               # Figma에서 추출한 에셋
│   ├── tokens/            # 디자인 토큰 (CSS, JSON)
│   ├── icons/             # 아이콘 SVG
│   └── images/            # 이미지 에셋
└── docs/                  # 문서
    ├── plugin-guide.md    # 플러그인 활용 가이드
    └── workflow-guide.md  # 워크플로우 가이드
```

## 필수 Figma 플러그인

### Tier 1 (반드시 설치)
- **Brandfetch** -- URL로 클라이언트/경쟁사 브랜드 에셋 즉시 가져오기
- **Unsplash** -- 무료 고품질 사진
- **Iconify** -- 200,000+ 아이콘
- **AVA Palettes** -- OKLCH 팔레트 + WCAG 접근성 체크
- **Print for Figma** -- CMYK, ICC 프로파일, 인쇄 규격
- **LottieFiles** -- 애니메이션 에셋

### Tier 2 (강력 추천)
- **Pitchdeck Presentation Studio** -- PPT/Keynote/PDF 내보내기
- **Mockuuups Studio** -- 기기/환경 목업
- **illustration.app** -- 브랜드 맞춤 AI 일러스트
- **Stark** -- 접근성 검사
- **Content Reel** -- 리얼한 더미 데이터

## 작업 규칙

1. Figma URL을 받으면 먼저 `get_design_context`로 전체 구조 파악
2. 디자인 토큰 추출 시 3계층 구조 준수 (Brand > Alias > Component)
3. 클라이언트별 에셋은 `brand-assets/{client-name}/` 하위에 정리
4. Code Connect 매핑 변경 시 반드시 기록 업데이트
5. 인쇄물 작업 시 CMYK 변환 필요 여부 확인 (Print for Figma 활용)
6. 모든 산출물은 한국어로 작성

## Figma 활용 가이드

### 브랜드 아이덴티티
- Figma Draw로 로고/뱃지 작업 (벡터 브러시, 텍스트 온 패스)
- Vectorize로 손 그림을 벡터로 변환
- 복잡한 로고는 Illustrator 작업 후 Figma로 임포트

### 마케팅 소재
- Figma Buzz로 SNS/광고 소재 대량 생산
- AI 이미지 생성 (배경 제거, 확장, 결합)
- 캠페인 배리언트는 브랜칭으로 관리

### 웹 퍼블리싱
- Figma Sites로 캠페인 랜딩 페이지 직접 퍼블리싱
- MCP + Code Connect로 디자인을 코드로 자동 변환

### 디자인 시스템
- Extended Collections로 멀티 브랜드 관리
- 코어 토큰(접근성, 그리드) + 브랜드 오버레이 구조
- 팀 라이브러리: Foundation / Components / Templates 3분류

### Figma 한계 & 하이브리드 워크플로우
- CMYK 색상 관리: Print for Figma 플러그인 활용
- 복잡한 벡터 일러스트: Illustrator 작업 후 임포트
- 다페이지 인쇄물: InDesign 병행
- 정밀 타이포그래피: Illustrator 병행

## 커뮤니케이션 원칙

1. **한국어 기본**: 모든 산출물은 한국어로 작성한다
2. **스타트업 눈높이**: 디자인 전문용어는 괄호 안에 쉬운 설명을 병기한다
3. **실행 가능성 우선**: 이론보다 바로 쓸 수 있는 결과물을 만든다
4. **80/20 원칙**: 핵심 20%에 집중하여 80% 효과를 낸다
