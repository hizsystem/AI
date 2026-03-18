# HUENIC 대시보드 — 구글시트 데이터 템플릿

> 이 문서는 휴닉팀이 채워넣을 구글시트의 구조를 정의합니다.
> 대시보드는 이 시트에서 데이터를 자동으로 읽어옵니다.

## 세팅 방법

1. 아래 구조대로 구글시트를 만든다
2. 파일 → 공유 → **"웹에 게시"** → 전체 문서 → CSV 형식 → 게시
3. 시트 ID를 대시보드에 등록 (URL의 `/d/여기/` 부분)

---

## 탭 1: `주간성과` (Weekly Metrics)

인국님이 **매주 금요일** Meta Business Suite에서 확인 후 입력합니다.

| 열 | 헤더명 | 예시 | 설명 |
|----|--------|------|------|
| A | brand | veggiet | veggiet 또는 vinker |
| B | week | 2026-W11 | ISO 주차 (YYYY-W##) |
| C | period | 2026-03-09 ~ 2026-03-15 | 해당 주 기간 |
| D | followers | 12340 | 주말 기준 팔로워 수 |
| E | followers_change | 127 | 전주 대비 변동 |
| F | posts_count | 3 | 이번 주 게시물 수 |
| G | engagement_rate | 4.2 | ER (%) |
| H | er_change | 0.3 | 전주 대비 ER 변동 (pp) |
| I | top_likes | 342 | 이번 주 최고 좋아요 수 |
| J | reach | 45200 | 이번 주 도달 |
| K | reach_change | 3200 | 전주 대비 도달 변동 |

**입력 예시:**
```
brand     week       period                    followers  followers_change  posts_count  engagement_rate  er_change  top_likes  reach   reach_change
veggiet   2026-W11   2026-03-09 ~ 2026-03-15   12340      127              3            4.2              0.3        342        45200   3200
veggiet   2026-W12   2026-03-16 ~ 2026-03-22   12580      240              4            4.5              0.3        415        51000   5800
vinker    2026-W11   2026-03-09 ~ 2026-03-15   2150       34               1            2.8              0.1        67         8900    450
```

---

## 탭 2: `베스트콘텐츠` (Top Content)

각 주의 성과 좋은 콘텐츠 1~3개.

| 열 | 헤더명 | 예시 | 설명 |
|----|--------|------|------|
| A | brand | veggiet | veggiet 또는 vinker |
| B | week | 2026-W11 | ISO 주차 |
| C | title | 아침 스무디 레시피 | 콘텐츠 제목 |
| D | type | feed | feed / reels / story |
| E | likes | 342 | 좋아요 수 |
| F | comments | 28 | 댓글 수 |

---

## 탭 3: `월간KPI` (Monthly KPI Summary)

월말에 정리. 전월 대비 변동은 수식으로 자동 계산 가능.

| 열 | 헤더명 | 예시 | 설명 |
|----|--------|------|------|
| A | brand | veggiet | |
| B | year | 2026 | |
| C | month | 3 | 숫자 (1~12) |
| D | followers | 12340 | 월말 팔로워 |
| E | followers_change | 890 | 전월 대비 |
| F | followers_change_pct | 7.8 | 변동률 (%) |
| G | monthly_posts | 12 | 월간 게시물 수 |
| H | posts_change | 2 | 전월 대비 |
| I | posts_change_pct | 20.0 | 변동률 (%) |
| J | avg_er | 4.2 | 월 평균 ER (%) |
| K | er_change | 0.5 | 전월 대비 (pp) |
| L | monthly_reach | 187500 | 월간 도달 |
| M | reach_change | 23400 | 전월 대비 |
| N | reach_change_pct | 14.3 | 변동률 (%) |

---

## 탭 4: `팔로워추이` (Follower Trend)

월별 팔로워 breakdown. KPI 차트에 사용.

| 열 | 헤더명 | 예시 | 설명 |
|----|--------|------|------|
| A | brand | veggiet | |
| B | month_label | 3월 | 표시용 라벨 |
| C | total | 12340 | 전체 팔로워 |
| D | organic | 9800 | 자연유입 |
| E | paid | 2540 | 광고 유입 |

---

## 탭 5: `ER추이` (ER Trend)

주별 ER breakdown. KPI 차트에 사용.

| 열 | 헤더명 | 예시 | 설명 |
|----|--------|------|------|
| A | brand | veggiet | |
| B | week_label | W11 | 표시용 라벨 |
| C | total | 4.2 | 전체 ER (%) |
| D | feed | 3.8 | 피드 ER |
| E | reels | 6.1 | 릴스 ER |
| F | story | 2.5 | 스토리 ER |

---

## 입력 규칙

1. **헤더 행(1행)은 정확히 위 헤더명과 일치**해야 합니다
2. 숫자는 천 단위 콤마 없이 입력 (12340, not 12,340)
3. ER/변동률은 소수점 한 자리까지 (4.2, not 4.23)
4. brand는 소문자 영문 (veggiet / vinker)
5. 빈 행은 건너뜁니다
