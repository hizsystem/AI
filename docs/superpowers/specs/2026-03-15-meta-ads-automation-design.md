# Meta 퍼포먼스 광고 자동화 — 설계 문서

> 작성일: 2026-03-15
> 상태: 확정
> 범위: Meta Marketing API 연동을 통한 캠페인 CRUD, 성과 수집, 데일리 자동 보고

---

## 1. 목표

Meta Marketing API를 연동하여 다음 5가지를 자동화한다:

1. **캠페인 직접 생성 및 세팅** — API로 캠페인/광고세트/광고 생성
2. **성과 분석 및 효율 측정** — ROAS, CPA, CTR 등 핵심 지표 수집
3. **메타 광고 집행** — 광고 ON/OFF, 예산 조정
4. **일자별 성과 비교** — 전일 대비 변화율, 주간 트렌드
5. **데일리 현황 보고** — 매일 09:00 Slack 자동 발송

## 2. 사용 범위

- 내부 용도 (MarketingOS 운영자 전용)
- 4개 이상 광고 계정 동시 관리
- 보고 채널: Slack Webhook

## 3. 아키텍처

```
Claude Code 세션 (수동)          Cron (자동, 매일 09:00)
       │                              │
       ▼                              ▼
scripts/meta/ ─── Python 핵심 라이브러리 ───
       │
       ▼
Meta Marketing API (facebook-business SDK)
       │
       ▼
Slack Webhook (데일리 보고)
```

Claude Code에서 수동으로 캠페인을 생성/관리하고, Cron이 매일 성과를 수집해서 Slack으로 보고한다.

## 4. 모듈 설계

### 4.1 auth.py — 인증 및 계정 관리

토큰 관리와 멀티 계정 선택을 담당한다.

```python
init_api(account_id) → FacebookAdsApi 인스턴스
get_account(account_id) → AdAccount 객체
list_accounts() → [{id, name}]  # config.yaml 기반
validate_token() → bool  # /me API 호출로 유효성 확인
```

- 환경변수 `META_ACCESS_TOKEN`에서 시스템 사용자 토큰 로드
- config.yaml에서 계정별 설정 로드
- 토큰 유효성 검사 실패 시: Slack으로 에러 알림 발송 후 종료 (Cron 컨텍스트에서 자동 복구 불가)

### 4.2 campaign_manager.py — 캠페인 CRUD

캠페인/광고세트/광고의 생성, 수정, 상태 변경을 담당한다.

```python
# 생성
create_campaign(account_id, name, objective, budget, schedule) → campaign_id
create_adset(campaign_id, name, targeting, placements, daily_budget) → adset_id
create_ad(adset_id, name, creative_id, status="PAUSED") → ad_id
upload_creative(account_id, image_path, name) → creative_id  # 이미지 업로드 → AdCreative 생성

# 운영
toggle_status(object_id, object_type, status)  # ACTIVE / PAUSED
update_budget(adset_id, new_daily_budget)

# 조회
list_campaigns(account_id, status_filter=None) → [{id, name, status, budget}]
get_campaign_structure(campaign_id) → {campaign, adsets: [{adset, ads: [...]}]}
```

안전장치:
- 광고는 항상 `PAUSED` 상태로 생성
- 일 예산 상한 체크 (config에서 설정)
- dry-run 모드 지원 (실제 API 호출 없이 구조 확인)
- 모든 생성 로그 JSON 저장

### 4.3 insights_fetcher.py — 성과 데이터 수집

Meta Insights API에서 성과 데이터를 수집하고 로컬 JSON으로 저장한다.

```python
# 일별 성과
fetch_daily(account_id, date) → {spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, roas}

# 기간별 성과
fetch_range(account_id, since, until) → [일별 데이터 리스트]

# 브레이크다운
fetch_by_campaign(account_id, date) → [{campaign_id, campaign_name, ...metrics}]
fetch_by_adset(campaign_id, date) → [{adset_id, adset_name, ...metrics}]
fetch_by_ad(adset_id, date) → [{ad_id, ad_name, ...metrics}]

# 로컬 저장
save_insights(account_id, data, date)  # → data/{account_id}/2026-03-15.json
```

수집 지표: spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, roas

### 4.4 performance_analyzer.py — 성과 비교 및 이상 감지

수집된 데이터를 분석하여 전일 비교, 트렌드, 이상 징후를 도출한다.

```python
# 전일 대비 비교
compare_daily(account_id, date) → {
    metrics: {ctr: {today: 1.8, yesterday: 2.1, change: -14.3%}, ...},
    alerts: [...]
}

# 주간 트렌드
weekly_trend(account_id, end_date=None) → {  # None이면 어제 기준 최근 7일
    trend: [{date, spend, ctr, cpa, roas}, ...],
    summary: "CPA 하락 추세 (좋음), CTR 정체"
}

# 이상 징후 감지
detect_anomalies(account_id, date) → [
    {type: "cpa_spike", value: 62%, message: "CPA 62% 급등"}
]
```

이상 징후 기준 (config.yaml에서 조정 가능):
- CTR 전일 대비 30% 하락 → 경고
- CPA 전일 대비 50% 상승 → 경고
- 예산 소진율 80% 미만 (= 하루 예산의 80%도 못 쓴 경우) → 타겟 확대 검토 경고

### 4.5 daily_reporter.py — 데일리 보고 + Slack 발송

Cron 진입점. 전체 계정을 순회하며 보고서를 생성하고 Slack으로 발송한다.

```python
run_daily_report(date=None)  # None이면 어제
format_account_block(account_id, insights, comparison, anomalies) → str
format_summary(all_accounts_data) → str
send_to_slack(message) → bool
```

실행 흐름:
1. 토큰 유효성 검사 → auth.validate_token()
2. 모든 활성 계정 순회 → insights_fetcher.fetch_daily()
3. 전일 대비 분석 → performance_analyzer.compare_daily()
4. 이상 징후 감지 → performance_analyzer.detect_anomalies()
5. Slack 메시지 포맷팅
6. Slack Webhook POST

에러 처리:
- 전체 흐름을 try/except로 감싸고, 실패 시 Slack으로 에러 메시지 발송
- 개별 계정 실패는 해당 계정만 건너뛰고 나머지 계정은 정상 보고
- API rate limit 발생 시 계정 간 2초 딜레이 후 재시도 (최대 3회)

## 5. Slack 보고서 포맷

```
Meta 광고 데일리 — 2026.03.15 (토)

[브랜드라이즈] 트래픽
지출 ₩19,200 (96%)  |  노출 3,412  |  클릭 68
CTR 1.99% (+12%)  |  CPC ₩282 (-8%)  |  ROAS 0.0x
전환 3건  |  CPA ₩6,400 (-15%)

[클라이언트 A] 전환
지출 ₩45,000 (90%)  |  노출 8,200  |  클릭 156
CTR 1.90% (-3%)  |  CPC ₩288 (+5%)  |  ROAS 3.2x (+8%)
전환 5건  |  CPA ₩9,000 (+22%)  |  매출 ₩144,000
>> 주의: CPA 22% 상승 — 소재 피로도 체크

───────────────────────────
전체: 계정 4개 | 지출 ₩128,400 | 전환 14건 | ROAS 2.1x
정상 3 | 주의 1 | 긴급 0
```

포맷 원칙:
- 이모지 최소화, 숫자와 텍스트 구조로 가독성 확보
- 캠페인 유형(트래픽/전환) 표시
- ROAS 항상 포함 (트래픽 캠페인은 0.0x 표시)
- 전환 캠페인은 매출액 추가 표시

## 6. 설정 파일

```yaml
# config.yaml
accounts:
  brandrise:
    ad_account_id: "act_XXXXXXXXX"
    name: "브랜드라이즈"
    daily_budget_alert: 50000
  client_a:
    ad_account_id: "act_YYYYYYYYY"
    name: "클라이언트 A"
    daily_budget_alert: 100000

slack:
  webhook_url_env: "SLACK_WEBHOOK_URL"
  channel: "#meta-ads-report"

report:
  time: "09:00"
  metrics: [spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, roas]
  alert_thresholds:
    ctr_drop: 30          # CTR 전일 대비 N% 이상 하락 시 경고
    cpa_spike: 50         # CPA 전일 대비 N% 이상 상승 시 경고
    budget_under: 80      # 예산 소진율 N% 미만 시 경고 (underspend)
```

config.yaml은 git에 포함하지 않고, config.yaml.example을 템플릿으로 커밋한다.

## 7. 파일 구조

```
scripts/meta/
├── __init__.py               # 패키지 임포트 지원
├── auth.py
├── campaign_manager.py
├── insights_fetcher.py
├── performance_analyzer.py
├── daily_reporter.py
├── config.yaml               # git 제외
├── config.yaml.example       # 템플릿
└── requirements.txt

data/                          # git 제외, 성과 데이터 누적
├── {account_id}/
│   ├── YYYY-MM-DD.json       # 일별 (90일 보관 후 자동 삭제)
│   └── weekly/
│       └── YYYY-WNN.json     # 주간 집계 (daily_reporter가 매주 월요일 자동 생성)

logs/                          # git 제외
└── daily_report.log
```

## 8. API 셋업 (1회성)

1. developers.facebook.com에서 앱 생성 (비즈니스 유형)
2. 비즈니스 관리자에서 시스템 사용자 생성 (관리자 역할)
3. 시스템 사용자 토큰 발급 (권한: ads_management, ads_read, business_management, read_insights)
4. 시스템 사용자에 광고 계정 4개 자산 할당
5. 환경변수 등록: `META_ACCESS_TOKEN`, `SLACK_WEBHOOK_URL`

## 9. 의존성

```
facebook-business>=19.0.0
pyyaml>=6.0
requests>=2.31.0
```

## 10. Cron 설정

```bash
# venv 활성화 후 실행 (facebook-business SDK 등 의존성 필요)
0 9 * * * cd /Users/wooseongmin/AI/.worktrees/meta-ads && scripts/meta/.venv/bin/python scripts/meta/daily_reporter.py >> logs/daily_report.log 2>&1
```

초기 venv 생성:
```bash
cd scripts/meta && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

수동 실행:
```bash
scripts/meta/.venv/bin/python scripts/meta/daily_reporter.py                      # 어제, 전체 계정
scripts/meta/.venv/bin/python scripts/meta/daily_reporter.py --date 2026-03-14    # 특정 날짜
scripts/meta/.venv/bin/python scripts/meta/daily_reporter.py --account brandrise  # 특정 계정
```

## 12. Slack 연동 경로

| 경로 | 용도 | 실행 환경 |
|------|------|----------|
| Slack Webhook | 데일리 자동 보고, 에러 알림 | Cron (독립 실행) |
| Slack MCP | 실시간 대화형 알림, 컨펌 요청 | Claude Code 세션 |

두 경로 모두 동일한 Slack 채널로 발송한다. Webhook은 세션 없이 동작하므로 Cron 자동화에 사용하고, MCP는 Claude Code에서 대화형으로 사용한다.

## 13. 데이터 보관 정책

| 단위 | 보관 기간 | 생성 시점 |
|------|----------|----------|
| 일별 JSON | 90일 | 매일 Cron 실행 시 |
| 주간 집계 JSON | 무기한 | 매주 월요일 Cron 실행 시 자동 |

90일 초과 일별 파일은 daily_reporter.py 실행 시 자동 삭제한다.

## 14. 안전장치

| 규칙 | 이유 |
|------|------|
| 광고는 항상 PAUSED 상태로 생성 | 실수로 바로 집행되는 것 방지 |
| 일 예산 상한 체크 | 예산 사고 방지 |
| dry-run 모드 지원 | 실제 API 호출 없이 구조 확인 |
| 모든 생성/변경 로그 저장 | 롤백 및 감사 추적 |
| 토큰은 환경변수에만 저장 | 코드/config에 토큰 노출 방지 |
