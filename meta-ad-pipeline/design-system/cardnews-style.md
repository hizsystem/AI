# Cardnews Design Style Guide

> @imjieun.mkt 레퍼런스 분석 기반, brandrise 카드뉴스 디자인 규칙
> designer 에이전트는 카드뉴스 제작 시 이 파일을 반드시 참조한다.

## 1. 캔버스

| 항목 | 값 | 비고 |
|------|---|------|
| 크기 | **1080 x 1350px** | 4:5 세로형 (인스타 피드 + Meta 광고 최적) |
| 싱글 광고 | 1080 x 1080px | 기존 유지 |
| 패딩 | 60px 좌우, 56px 상하 | 넉넉한 여백 |
| 안전 영역 | 사방 48px | 텍스트/요소가 이 안에 |

## 2. 배경 테마

### warm-light (카드뉴스 기본)
```css
background: #F5F0EB;  /* 따뜻한 웜그레이 */
color: #1A1A1A;       /* 거의 블랙 */
```

### warm-accent (커버용)
```css
background: #E8752E;  /* 따뜻한 오렌지 */
color: #1A1A1A;       /* 블랙 텍스트 */
```

### dark (클로징/감성 슬라이드)
```css
background: #1A1A1A;
color: #FFFFFF;
accent: #E8752E;  /* 오렌지 강조 */
```

## 3. 타이포그래피

| 요소 | 크기 | 굵기 | 색상 |
|------|------|------|------|
| 헤드라인 | 72-80px | 900 (Black) | #1A1A1A |
| 서브 헤드라인 | 50-56px | 700 (Bold) | #1A1A1A |
| 본문 | 34-40px | 400-500 | #3D3D3D |
| 본문 강조 | 34-40px | 700 (Bold) | accent color |
| 캡션/크레딧 | 24-26px | 400 | #9E9E9E |
| 태그/배지 | 28-30px | 600 | accent color |
| 페이지 번호 | 26px | 500 | #9E9E9E |

### 강조 규칙
- **핵심 숫자**: accent color + bold (예: "411줄" → 오렌지 볼드)
- **핵심 구절**: bold 처리 (예: "완전 다른 시스템이에요")
- 슬라이드당 accent 강조는 **최대 2-3개** (과하면 효과 감소)

## 4. 레이아웃 시스템

### 커버 슬라이드
```
[태그 배지: 좌상단, pill shape]
[헤드라인: 대형, 좌측 정렬, 상단 40% 영역]
[서브타이틀: 중형]
[일러스트/비주얼: 우하단]
[크레딧: 좌하단, 작게]
```

### 본문 슬라이드 (Q&A 포맷)
```
[Q 배지: 좌상단, 원형, accent 색상]     [페이지: 우상단, "03 / 10"]
[헤드라인 질문: 대형 볼드, 최대 2줄]

[본문 텍스트: 3-5줄, 핵심만]

[비주얼 컴포넌트: 슬라이드 하단 50%]
  - 코드 블록, 비교 카드, 컬러 바, 체크리스트 중 택 1

[크레딧: 하단 중앙, "마케터 임지은 · @imjieun.mkt" 스타일]
```

### 클로징 슬라이드
```
[태그: 좌상단]                            [페이지: 우상단]
[헤드라인 질문: 대형]

[감성 텍스트: 여러 줄, line-height 넉넉하게]

[구분선: 짧은 수평선]
[accent 메시지: 큰 글자, accent 색상]
```

### CTA/팔로우 슬라이드
```
[아바타/로고: 중앙 상단]
[CTA 텍스트: 대형 볼드, 중앙]
[서브 텍스트: 설명]
[@핸들: pill 배지, 중앙]
```

## 5. 컴포넌트 라이브러리

### 5-1. Q 배지
```css
.q-badge {
  width: 48px; height: 48px;
  background: #E8752E;
  border-radius: 12px;
  color: #FFFFFF;
  font-size: 24px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
```

### 5-2. 페이지 번호
```css
.page-num {
  font-size: 22px; font-weight: 500;
  color: #9E9E9E;
  /* 형식: "03 / 10" */
}
```

### 5-3. 터미널 코드 블록
```css
.terminal {
  background: #2D2D2D;
  border-radius: 16px;
  overflow: hidden;
}
.terminal-header {
  padding: 16px 20px;
  display: flex; align-items: center; gap: 8px;
  /* 빨강/노랑/초록 점 3개 */
}
.terminal-dot { width: 14px; height: 14px; border-radius: 50%; }
.terminal-dot.red { background: #FF5F57; }
.terminal-dot.yellow { background: #FEBC2E; }
.terminal-dot.green { background: #28C840; }
.terminal-title {
  margin-left: 12px;
  font-size: 18px; color: #9E9E9E;
  font-family: monospace;
}
.terminal-body {
  padding: 24px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 20px; line-height: 1.7;
  color: #E0E0E0;
}
/* 구문 강조 */
.terminal-body .key { color: #82AAFF; }    /* 변수명 */
.terminal-body .value { color: #C3E88D; }  /* 값 */
.terminal-body .comment { color: #6B7280; } /* 주석 */
.terminal-body .error { color: #EF4444; }   /* 에러 */
.terminal-body .accent { color: #E8752E; }  /* 강조 */
```

### 5-4. 컬러 바 카드 (에이전트/항목 나열용)
```css
.color-bar {
  display: flex; align-items: center;
  padding: 20px 24px;
  border-radius: 14px;
  margin-bottom: 12px;
  color: #FFFFFF;
  font-weight: 700;
}
/* 컬러 변형 */
.color-bar.orange  { background: linear-gradient(90deg, #F97316, #FB923C); }
.color-bar.blue    { background: linear-gradient(90deg, #3B82F6, #60A5FA); }
.color-bar.purple  { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }
.color-bar.green   { background: linear-gradient(90deg, #22C55E, #4ADE80); }
.color-bar.pink    { background: linear-gradient(90deg, #EC4899, #F472B6); }
.color-bar.teal    { background: linear-gradient(90deg, #14B8A6, #2DD4BF); }

.color-bar .name { flex: 0 0 160px; font-size: 22px; }
.color-bar .role { flex: 1; font-size: 20px; font-weight: 600; }
.color-bar .constraint {
  font-size: 18px; font-weight: 600;
  background: rgba(0,0,0,0.15); padding: 6px 14px; border-radius: 8px;
}
```

### 5-5. Before/After 비교 카드
```css
.compare-row {
  display: flex; gap: 20px;
}
.compare-card {
  flex: 1;
  border-radius: 16px;
  padding: 28px;
}
.compare-card.before {
  background: linear-gradient(135deg, #FECACA, #FCA5A5);
  color: #991B1B;
}
.compare-card.after {
  background: linear-gradient(135deg, #A7F3D0, #6EE7B7);
  color: #065F46;
}
.compare-label {
  font-size: 18px; font-weight: 700;
  padding: 4px 12px; border-radius: 6px;
  display: inline-block; margin-bottom: 12px;
}
.compare-card.before .compare-label { background: #FCA5A5; }
.compare-card.after .compare-label { background: #6EE7B7; }
.compare-number {
  font-size: 48px; font-weight: 900;
  margin-bottom: 8px;
}
.compare-desc {
  font-size: 20px; font-weight: 500;
  line-height: 1.5;
}
```

### 5-6. 인사이트 바 (하이라이트 메시지)
```css
.insight-bar {
  background: linear-gradient(90deg, #F97316, #FB923C);
  border-radius: 14px;
  padding: 20px 28px;
  color: #FFFFFF;
  font-size: 22px; font-weight: 700;
  display: flex; align-items: center; gap: 12px;
}
.insight-bar .icon { font-size: 28px; }
```

### 5-7. 체크리스트 (검수/항목 나열용)
```css
.checklist-item {
  display: flex; align-items: center;
  padding: 20px 24px;
  background: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.checklist-icon {
  width: 32px; height: 32px;
  background: #E8752E; border-radius: 8px;
  color: #FFFFFF;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; margin-right: 16px;
}
.checklist-label { flex: 1; font-size: 22px; font-weight: 600; color: #1A1A1A; }
.checklist-value { font-size: 20px; font-weight: 500; color: #6B7280; font-family: monospace; }
```

## 6. 크레딧

```css
.credit {
  position: absolute;
  bottom: 40px;
  left: 0; right: 0;
  text-align: center;
  font-size: 20px; font-weight: 400;
  color: #9E9E9E;
}
/* brandrise 버전: "brandrise · @brandrise_mkt" */
```

## 7. 슬라이드 구성 공식 (10장 기준)

| 슬라이드 | 유형 | 배경 | 핵심 |
|----------|------|------|------|
| 01 | 커버 | warm-accent (오렌지) | 큰 제목 + 서브 + 일러스트 |
| 02-08 | 본문 | warm-light (웜그레이) | Q&A 포맷 + 비주얼 컴포넌트 |
| 09 | 클로징 | dark (블랙) | 감성 메시지 + accent CTA |
| 10 | CTA | warm-light 또는 크림 | 팔로우/연락처 안내 |

## 8. 기존 싱글 광고와의 구분

| 항목 | 싱글 광고 | 캐러셀 카드뉴스 |
|------|----------|---------------|
| 캔버스 | 1080x1080 | 1080x1350 (4:5) |
| 테마 | dark/black | warm-light/warm-accent |
| CTA | 하단 바 (항상) | 마지막 슬라이드에만 |
| 로고 | 우상단 (항상) | 커버만 or 크레딧으로 |
| 분위기 | 테크/퍼포먼스 | 에디토리얼/잡지 |
