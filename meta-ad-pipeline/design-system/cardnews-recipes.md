# Cardnews Recipe System — 베리에이션 디자인 가이드

> 작성일: 2026-03-01
> 목적: 브랜드 일관성을 유지하면서 시리즈마다 시각적 다양성을 확보한다.
> **카드뉴스 제작 시 반드시 이 문서를 참조하여 레시피를 선택/지정한다.**

---

## 1. 고정 요소 (brandrise 정체성 — 절대 변경 금지)

| 요소 | 값 | 비고 |
|------|---|------|
| 캔버스 | 1080 x 1350px | 4:5 세로형 (메타 광고 표준) |
| 폰트 | Pretendard | CDN 로딩 |
| 좌우 패딩 | 60px | 안전 영역 48px |
| 상하 패딩 | 56px | |
| 크레딧 | "brandrise · @brandrise_kr" | 하단 중앙, 20px, muted color |
| 콘텐츠 구조 | Pain → Value → Proof | 모든 시리즈 공통 |
| 슬라이드 구성 | 커버 → 본문 → 클로징 → CTA | 순서 고정 |

### 컬러 원칙 (필수)
- **탁한(desaturated/muddy) 컬러 절대 금지** — 커버 배경은 항상 선명하고 채도 높은 색상 사용
- 커버 BG 채도: HSL 기준 S값 70% 이상 유지
- 다크 슬라이드는 순수한 다크(#0A0A0A ~ #1A1A1A)로, 회색끼 있는 다크 금지
- 본문 배경은 거의 화이트에 가까운 밝은 톤 (탁한 베이지/그레이 금지)

---

## 2. 변동 레이어 1: 컬러 팔레트 (5종)

### 2-1. Warm (기본)
```css
:root {
  --palette: "warm";
  --cover-bg: #E8752E;
  --cover-text: #1A1A1A;
  --cover-highlight: #FFFFFF;
  --accent: #E8752E;
  --accent-light: #FB923C;
  --body-bg: #F5F0EB;
  --body-text: #1A1A1A;
  --body-secondary: #3D3D3D;
  --body-muted: #9E9E9E;
  --card-bg: #FFFFFF;
  --dark-bg: #1A1A1A;
  --dark-text: #FFFFFF;
  --dark-accent: #E8752E;
  --cta-button: #E8752E;
  --cta-text: #FFFFFF;
}
```
**무드**: 에너지, 친근, 액션
**적합**: Seg1-2, 공감형 콘텐츠

### 2-2. Ocean
```css
:root {
  --palette: "ocean";
  --cover-bg: #2563EB;  /* 선명한 블루 — 탁한 네이비 금지 */
  --cover-text: #FFFFFF;
  --cover-highlight: #BFDBFE;
  --accent: #3B82F6;
  --accent-light: #60A5FA;
  --body-bg: #F8FAFC;  /* 거의 화이트에 가까운 쿨톤 */
  --body-text: #1A1A1A;
  --body-secondary: #334155;
  --body-muted: #94A3B8;
  --card-bg: #FFFFFF;
  --dark-bg: #0F172A;
  --dark-text: #FFFFFF;
  --dark-accent: #60A5FA;
  --cta-button: #3B82F6;
  --cta-text: #FFFFFF;
}
```
**무드**: 신뢰, 전문성, 안정
**적합**: Seg3-4, B2B, 데이터 중심

### 2-3. Forest
```css
:root {
  --palette: "forest";
  --cover-bg: #16A34A;  /* 선명한 그린 — 탁한 다크그린 금지 */
  --cover-text: #FFFFFF;
  --cover-highlight: #4ADE80;
  --accent: #22C55E;
  --accent-light: #4ADE80;
  --body-bg: #F0FDF4;
  --body-text: #1A1A1A;
  --body-secondary: #374151;
  --body-muted: #9CA3AF;
  --card-bg: #FFFFFF;
  --dark-bg: #052E16;
  --dark-text: #FFFFFF;
  --dark-accent: #4ADE80;
  --cta-button: #22C55E;
  --cta-text: #FFFFFF;
}
```
**무드**: 성장, 안정, 자연스러움
**적합**: Seg3, 성장/스케일업 콘텐츠

### 2-4. Night
```css
:root {
  --palette: "night";
  --cover-bg: #7C3AED;  /* 선명한 퍼플 — 탁한 다크퍼플 금지 */
  --cover-text: #FFFFFF;
  --cover-highlight: #A78BFA;
  --accent: #8B5CF6;
  --accent-light: #A78BFA;
  --body-bg: #F5F3FF;
  --body-text: #1A1A1A;
  --body-secondary: #4B5563;
  --body-muted: #9CA3AF;
  --card-bg: #FFFFFF;
  --dark-bg: #0F0B2E;
  --dark-text: #FFFFFF;
  --dark-accent: #A78BFA;
  --cta-button: #8B5CF6;
  --cta-text: #FFFFFF;
}
```
**무드**: 프리미엄, 혁신, 깊이
**적합**: Seg4, 전략적/프리미엄 콘텐츠

### 2-5. Mono
```css
:root {
  --palette: "mono";
  --cover-bg: #1A1A1A;
  --cover-text: #FFFFFF;
  --cover-highlight: #E8752E;
  --accent: #E8752E;
  --accent-light: #FB923C;
  --body-bg: #F5F5F5;
  --body-text: #1A1A1A;
  --body-secondary: #525252;
  --body-muted: #A3A3A3;
  --card-bg: #FFFFFF;
  --dark-bg: #0A0A0A;
  --dark-text: #FFFFFF;
  --dark-accent: #E8752E;
  --cta-button: #1A1A1A;
  --cta-text: #FFFFFF;
}
```
**무드**: 미니멀, 세련, 감성
**적합**: 전 세그먼트, 감성형 콘텐츠

---

## 3. 변동 레이어 2: 커버 레이아웃 (4종)

### 3-1. Editorial (현재)
```
[태그 배지: 좌상단]
[헤드라인: 좌정렬, 상단 35%]
[서브타이틀: 좌정렬]

                          [장식 도형: 우하단]
[크레딧: 좌하단]
```
- 가장 범용적, 텍스트가 길어도 안정적

### 3-2. Centered
```
              [태그 배지: 중앙 상단]

          ─────────────────────
            [헤드라인: 중앙 정렬]
            [서브타이틀: 중앙]
          ─────────────────────


              [크레딧: 하단 중앙]
```
- 깔끔하고 정돈된 느낌, 짧은 헤드라인에 적합

### 3-3. Hero Stat
```
[태그 배지: 좌상단]

        [거대 숫자: 120-160px, 중앙]
             "72%"
        [숫자 설명: 중형, 중앙]
        "스타트업 대표가 번아웃을
         경험합니다"

[크레딧: 하단 중앙]
```
- 숫자/데이터가 강한 콘텐츠에 최적, 임팩트 극대화

### 3-4. Split
```
┌──────────────┬──────────────┐
│              │              │
│  [컬러 면]    │  [텍스트 면]  │
│              │              │
│  (accent bg) │  [태그]       │
│              │  [헤드라인]   │
│              │  [서브]       │
│              │              │
│              │  [크레딧]     │
└──────────────┴──────────────┘
```
- 좌우 분할로 시각적 긴장감, 감성 콘텐츠에 적합

---

## 4. 변동 레이어 3: 배경 텍스처 (4종)

### 4-1. Clean
```css
/* 플랫 단색 — 텍스처 없음 */
.texture-clean { /* no additional styling */ }
```

### 4-2. Gradient Mesh
```css
.texture-gradient::before {
  content: '';
  position: absolute;
  width: 600px; height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-light) 0%, transparent 70%);
  opacity: 0.08;
  top: -200px; right: -200px;
}
.texture-gradient::after {
  content: '';
  position: absolute;
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  opacity: 0.06;
  bottom: -100px; left: -100px;
}
```

### 4-3. Dot Grid
```css
.texture-dotgrid {
  background-image: radial-gradient(circle, var(--body-muted) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 0 0;
}
/* 커버에서는 dot color를 rgba(255,255,255,0.1)로 */
```

### 4-4. Noise
```css
.texture-noise::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
  pointer-events: none;
}
```

---

## 5. 추가 컴포넌트 (기존 5종 + 신규 5종)

### 기존 컴포넌트
1. **터미널 코드블록** — 데이터/분석 표현
2. **컬러 바 카드** — 항목 나열
3. **체크리스트** — 검수/실행 항목
4. **Before/After 비교** — 성과 대비
5. **인사이트 바** — 핵심 메시지 강조

### 신규 컴포넌트

#### 5-6. Stat Card Cluster
```css
.stat-cluster {
  display: flex; gap: 16px;
}
.stat-card {
  flex: 1;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-card .number {
  font-size: 48px; font-weight: 900;
  color: var(--accent);
  margin-bottom: 8px;
}
.stat-card .label {
  font-size: 20px; font-weight: 500;
  color: var(--body-secondary);
}
```

#### 5-7. Timeline Flow
```css
.timeline {
  position: relative;
  padding-left: 40px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 15px; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent), var(--accent-light));
}
.timeline-item {
  position: relative;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -33px; top: 24px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--body-bg);
}
.timeline-step {
  font-size: 18px; font-weight: 700; color: var(--accent);
}
.timeline-text {
  font-size: 22px; font-weight: 600; color: var(--body-text);
}
```

#### 5-8. Quote Block
```css
.quote-block {
  position: relative;
  padding: 32px 40px;
  background: var(--card-bg);
  border-radius: 16px;
  border-left: 4px solid var(--accent);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.quote-block::before {
  content: '"';
  position: absolute;
  top: -8px; left: 20px;
  font-size: 80px; font-weight: 900;
  color: var(--accent);
  opacity: 0.2;
  line-height: 1;
}
.quote-text {
  font-size: 26px; font-weight: 600;
  color: var(--body-text);
  line-height: 1.6;
  font-style: italic;
}
.quote-author {
  margin-top: 16px;
  font-size: 20px; font-weight: 500;
  color: var(--body-muted);
}
```

#### 5-9. Icon Grid
```css
.icon-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.icon-grid.cols-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.icon-cell {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.icon-cell .icon {
  font-size: 40px;
  margin-bottom: 12px;
}
.icon-cell .title {
  font-size: 22px; font-weight: 700;
  color: var(--body-text);
  margin-bottom: 6px;
}
.icon-cell .desc {
  font-size: 18px; font-weight: 400;
  color: var(--body-secondary);
}
```

#### 5-10. Progress Meter
```css
.meter-list {
  display: flex; flex-direction: column; gap: 16px;
}
.meter-item .meter-label {
  display: flex; justify-content: space-between;
  margin-bottom: 8px;
}
.meter-item .label-text {
  font-size: 22px; font-weight: 600; color: var(--body-text);
}
.meter-item .label-value {
  font-size: 22px; font-weight: 700; color: var(--accent);
}
.meter-bar {
  height: 20px;
  background: rgba(0,0,0,0.06);
  border-radius: 10px;
  overflow: hidden;
}
.meter-fill {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
```

---

## 6. 사전 정의 레시피

| 레시피 ID | 팔레트 | 커버 | 텍스처 | 추천 용도 |
|----------|--------|------|--------|----------|
| R1-warm-editorial | Warm | Editorial | Clean | 기본, 범용 |
| R2-ocean-centered | Ocean | Centered | Dot Grid | 전문적 정보 전달 |
| R3-forest-hero | Forest | Hero Stat | Gradient | 성장 데이터 중심 |
| R4-night-editorial | Night | Editorial | Clean | 프리미엄 전략 |
| R5-mono-split | Mono | Split | Noise | 감성형 스토리 |
| R6-warm-hero | Warm | Hero Stat | Clean | 숫자 임팩트 |
| R7-ocean-editorial | Ocean | Editorial | Gradient | B2B 인사이트 |
| R8-forest-centered | Forest | Centered | Clean | 교육형 가이드 |
| R9-night-hero | Night | Hero Stat | Dot Grid | 데이터 + 프리미엄 |
| R10-mono-centered | Mono | Centered | Noise | 미니멀 감성 |

---

## 7. 레시피 선택 규칙

1. **직전 시리즈와 같은 팔레트 금지** — 피드에서 연속 같은 색 방지
2. **같은 세그먼트 내 커버 레이아웃 중복 최소화**
3. **팔레트-세그먼트 적합도 우선 참조** (§2의 "적합" 참고)
4. 사용자가 직접 레시피를 지정할 수 있음: `레시피: R5-mono-split`
5. 미지정 시, 최근 사용 이력을 보고 자동 선택

---

## 8. 기존 시리즈 레시피 매핑

| 시리즈 | 현재 레시피 | 권장 변경 |
|--------|-----------|----------|
| Seg1: 아이디어 검증 | R1-warm-editorial | 유지 |
| Seg1: 정부지원금 | R1-warm-editorial | → **R2-ocean-centered** |
| Seg2: 마케팅 순서 | R1-warm-editorial | 유지 (최초 시리즈) |
| Seg2: 투자금 예산 | R1-warm-editorial | → R6-warm-hero |
| Seg2: 대행사 실망 | R1-warm-editorial | → R4-night-editorial |
| Seg2: 좋은 제품 | R1-warm-editorial | → **R3-forest-hero** |
| Seg2: 대표 번아웃 | R1-warm-editorial | → **R5-mono-split** |
| Seg3: 전략 부재 | R1-warm-editorial | → R7-ocean-editorial |
| Seg4: 대행사 파편화 | R1-warm-editorial | → R9-night-hero |
| Seg3+4: CMO 딜레마 | R1-warm-editorial | → R8-forest-centered |
