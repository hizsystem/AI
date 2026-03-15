# Meta 퍼포먼스 광고 자동화 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Meta Marketing API를 연동하여 캠페인 생성, 성과 수집, 일자별 비교, 데일리 Slack 보고를 자동화한다.

**Architecture:** Python SDK(`facebook-business`)로 Meta API를 호출하는 5개 모듈 구성. Cron으로 매일 09:00 성과를 수집하고 Slack Webhook으로 보고서를 발송한다. 모든 모듈은 `scripts/meta/` 패키지에 위치하며 멀티 계정을 지원한다.

**Tech Stack:** Python 3.11+, facebook-business SDK, PyYAML, requests, pytest

**Spec:** `docs/superpowers/specs/2026-03-15-meta-ads-automation-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `scripts/meta/__init__.py` | 패키지 초기화 |
| `scripts/meta/auth.py` | 토큰 로드, API 초기화, 계정 선택, 토큰 검증 |
| `scripts/meta/config.yaml.example` | 멀티 계정 설정 템플릿 |
| `scripts/meta/requirements.txt` | 의존성 목록 |
| `scripts/meta/insights_fetcher.py` | Meta Insights API 호출, JSON 저장 |
| `scripts/meta/performance_analyzer.py` | 전일 비교, 주간 트렌드, 이상 징후 감지 |
| `scripts/meta/daily_reporter.py` | Slack 보고서 포맷팅 + Webhook 발송, Cron 진입점 |
| `scripts/meta/campaign_manager.py` | 캠페인/광고세트/광고 CRUD, 소재 업로드 |
| `tests/meta/test_auth.py` | auth 모듈 테스트 |
| `tests/meta/test_insights_fetcher.py` | insights 모듈 테스트 |
| `tests/meta/test_performance_analyzer.py` | analyzer 모듈 테스트 |
| `tests/meta/test_daily_reporter.py` | reporter 모듈 테스트 |
| `tests/meta/test_campaign_manager.py` | campaign 모듈 테스트 |
| `tests/meta/conftest.py` | 공유 fixture (mock config, sample data) |

---

## Chunk 1: 프로젝트 셋업 + auth 모듈

### Task 1: 프로젝트 구조 생성 및 의존성 설치

**Files:**
- Create: `scripts/meta/__init__.py`
- Create: `scripts/meta/requirements.txt`
- Create: `scripts/meta/config.yaml.example`
- Create: `tests/meta/__init__.py`
- Create: `tests/meta/conftest.py`

- [ ] **Step 1: 디렉토리 생성**

```bash
mkdir -p scripts/meta tests/meta data logs
```

- [ ] **Step 2: requirements.txt 생성**

```
facebook-business>=19.0.0
pyyaml>=6.0
requests>=2.31.0
pytest>=8.0.0
```

- [ ] **Step 3: venv 생성 및 의존성 설치**

```bash
cd scripts/meta && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```

Expected: Successfully installed facebook-business pyyaml requests pytest

- [ ] **Step 4: __init__.py 생성**

```python
# scripts/meta/__init__.py
"""Meta Marketing API automation package."""
```

```python
# tests/meta/__init__.py
```

- [ ] **Step 5: config.yaml.example 생성**

```yaml
# config.yaml.example
# 복사 후 config.yaml로 이름 변경하여 사용
# cp config.yaml.example config.yaml

accounts:
  brandrise:
    ad_account_id: "act_XXXXXXXXX"
    name: "브랜드라이즈"
    daily_budget_alert: 50000
  # client_a:
  #   ad_account_id: "act_YYYYYYYYY"
  #   name: "클라이언트 A"
  #   daily_budget_alert: 100000

slack:
  webhook_url_env: "SLACK_WEBHOOK_URL"

report:
  time: "09:00"
  metrics: [spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, roas]
  alert_thresholds:
    ctr_drop: 30          # CTR 전일 대비 N% 이상 하락 시 경고
    cpa_spike: 50         # CPA 전일 대비 N% 이상 상승 시 경고
    budget_under: 80      # 예산 소진율 N% 미만 시 경고 (underspend)
```

- [ ] **Step 6: conftest.py — 공유 fixture 생성**

```python
# tests/meta/conftest.py
import pytest
from pathlib import Path
import json
import yaml


@pytest.fixture
def sample_config(tmp_path):
    """테스트용 config.yaml 생성"""
    config = {
        "accounts": {
            "brandrise": {
                "ad_account_id": "act_123456",
                "name": "브랜드라이즈",
                "daily_budget_alert": 50000,
            },
            "client_a": {
                "ad_account_id": "act_789012",
                "name": "클라이언트 A",
                "daily_budget_alert": 100000,
            },
        },
        "slack": {"webhook_url_env": "SLACK_WEBHOOK_URL"},
        "report": {
            "time": "09:00",
            "metrics": ["spend", "impressions", "clicks", "ctr", "cpc", "cpm",
                        "conversions", "cpa", "roas"],
            "alert_thresholds": {
                "ctr_drop": 30,
                "cpa_spike": 50,
                "budget_under": 80,
            },
        },
    }
    config_path = tmp_path / "config.yaml"
    config_path.write_text(yaml.dump(config, allow_unicode=True))
    return config_path


@pytest.fixture
def sample_daily_insights():
    """어제 성과 데이터 샘플"""
    return {
        "date": "2026-03-14",
        "account_id": "act_123456",
        "spend": 19200,
        "impressions": 3412,
        "clicks": 68,
        "ctr": 1.99,
        "cpc": 282,
        "cpm": 5628,
        "conversions": 3,
        "cpa": 6400,
        "roas": 0.0,
    }


@pytest.fixture
def sample_yesterday_insights():
    """그저께 성과 데이터 샘플 (비교용)"""
    return {
        "date": "2026-03-13",
        "account_id": "act_123456",
        "spend": 18500,
        "impressions": 3200,
        "clicks": 57,
        "ctr": 1.78,
        "cpc": 325,
        "cpm": 5781,
        "conversions": 2,
        "cpa": 9250,
        "roas": 0.0,
    }


@pytest.fixture
def data_dir(tmp_path):
    """테스트용 data 디렉토리"""
    d = tmp_path / "data"
    d.mkdir()
    return d
```

- [ ] **Step 7: .gitignore 업데이트**

기존 `.gitignore`에 다음 추가:
```
scripts/meta/config.yaml
scripts/meta/.venv/
data/
logs/
```

- [ ] **Step 8: Commit**

```bash
git add scripts/meta/__init__.py scripts/meta/requirements.txt scripts/meta/config.yaml.example \
       tests/meta/__init__.py tests/meta/conftest.py .gitignore
git commit -m "feat: meta ads automation 프로젝트 구조 생성"
```

---

### Task 2: auth.py — 인증 및 계정 관리

**Files:**
- Create: `scripts/meta/auth.py`
- Create: `tests/meta/test_auth.py`

- [ ] **Step 1: 테스트 작성**

```python
# tests/meta/test_auth.py
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from meta.auth import load_config, list_accounts, init_api, get_account, validate_token


class TestLoadConfig:
    def test_loads_yaml(self, sample_config):
        config = load_config(sample_config)
        assert "accounts" in config
        assert "brandrise" in config["accounts"]

    def test_missing_file_raises(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            load_config(tmp_path / "nonexistent.yaml")


class TestListAccounts:
    def test_returns_all_accounts(self, sample_config):
        accounts = list_accounts(sample_config)
        assert len(accounts) == 2
        assert accounts[0]["id"] == "act_123456"
        assert accounts[0]["name"] == "브랜드라이즈"


class TestInitApi:
    @patch("meta.auth.FacebookAdsApi.init")
    def test_initializes_with_token(self, mock_init, sample_config, monkeypatch):
        monkeypatch.setenv("META_ACCESS_TOKEN", "test_token_123")
        api = init_api("brandrise", sample_config)
        mock_init.assert_called_once()

    def test_missing_token_raises(self, sample_config, monkeypatch):
        monkeypatch.delenv("META_ACCESS_TOKEN", raising=False)
        with pytest.raises(EnvironmentError, match="META_ACCESS_TOKEN"):
            init_api("brandrise", sample_config)

    def test_invalid_account_raises(self, sample_config, monkeypatch):
        monkeypatch.setenv("META_ACCESS_TOKEN", "test_token_123")
        with pytest.raises(KeyError, match="unknown_account"):
            init_api("unknown_account", sample_config)


class TestValidateToken:
    @patch("meta.auth.requests.get")
    def test_valid_token(self, mock_get, monkeypatch):
        monkeypatch.setenv("META_ACCESS_TOKEN", "valid_token")
        mock_get.return_value = MagicMock(status_code=200, json=lambda: {"id": "123"})
        assert validate_token() is True

    @patch("meta.auth.requests.get")
    def test_invalid_token(self, mock_get, monkeypatch):
        monkeypatch.setenv("META_ACCESS_TOKEN", "invalid_token")
        mock_get.return_value = MagicMock(status_code=400)
        assert validate_token() is False
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_auth.py -v
```

Expected: ModuleNotFoundError (meta.auth 아직 없음)

- [ ] **Step 3: auth.py 구현**

```python
# scripts/meta/auth.py
"""Meta Marketing API 인증 및 계정 관리."""
from __future__ import annotations

import os
from pathlib import Path

import requests
import yaml

# facebook_business는 런타임에서만 필요 (테스트에서는 mock)
try:
    from facebook_business.api import FacebookAdsApi
    from facebook_business.adobjects.adaccount import AdAccount
except ImportError:
    FacebookAdsApi = None
    AdAccount = None

CONFIG_DIR = Path(__file__).parent
DEFAULT_CONFIG_PATH = CONFIG_DIR / "config.yaml"


def load_config(config_path: Path | None = None) -> dict:
    """config.yaml 로드."""
    path = config_path or DEFAULT_CONFIG_PATH
    if not path.exists():
        raise FileNotFoundError(f"설정 파일 없음: {path}")
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def list_accounts(config_path: Path | None = None) -> list[dict]:
    """등록된 모든 광고 계정 목록 반환."""
    config = load_config(config_path)
    return [
        {"key": key, "id": acc["ad_account_id"], "name": acc["name"]}
        for key, acc in config["accounts"].items()
    ]


def _get_token() -> str:
    """환경변수에서 Meta API 토큰 로드."""
    token = os.environ.get("META_ACCESS_TOKEN")
    if not token:
        raise EnvironmentError("META_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.")
    return token


def init_api(account_key: str, config_path: Path | None = None) -> "FacebookAdsApi":
    """Meta API 초기화 및 반환."""
    config = load_config(config_path)
    if account_key not in config["accounts"]:
        raise KeyError(f"계정 '{account_key}'을(를) config에서 찾을 수 없습니다: {account_key}")
    token = _get_token()
    api = FacebookAdsApi.init(access_token=token)
    return api


def get_account(account_key: str, config_path: Path | None = None) -> "AdAccount":
    """광고 계정 객체 반환."""
    config = load_config(config_path)
    if account_key not in config["accounts"]:
        raise KeyError(f"계정 '{account_key}'을(를) config에서 찾을 수 없습니다: {account_key}")
    account_id = config["accounts"][account_key]["ad_account_id"]
    init_api(account_key, config_path)
    return AdAccount(account_id)


def validate_token() -> bool:
    """토큰 유효성 검사 (/me API 호출)."""
    try:
        token = _get_token()
    except EnvironmentError:
        return False
    resp = requests.get(
        "https://graph.facebook.com/v21.0/me",
        params={"access_token": token},
        timeout=10,
    )
    return resp.status_code == 200
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_auth.py -v
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/meta/auth.py tests/meta/test_auth.py
git commit -m "feat: auth 모듈 — 토큰 관리, 멀티 계정 선택, 토큰 검증"
```

---

## Chunk 2: 성과 수집 + 분석 모듈

### Task 3: insights_fetcher.py — 성과 데이터 수집

**Files:**
- Create: `scripts/meta/insights_fetcher.py`
- Create: `tests/meta/test_insights_fetcher.py`

- [ ] **Step 1: 테스트 작성**

```python
# tests/meta/test_insights_fetcher.py
import pytest
import json
from unittest.mock import patch, MagicMock
from pathlib import Path
from datetime import date

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from meta.insights_fetcher import (
    fetch_daily, save_insights, load_insights, fetch_range,
    METRICS_FIELDS,
)


class TestFetchDaily:
    @patch("meta.insights_fetcher.get_account")
    def test_returns_metrics_dict(self, mock_get_account, sample_config, monkeypatch):
        monkeypatch.setenv("META_ACCESS_TOKEN", "test_token")
        mock_account = MagicMock()
        mock_account.get_insights.return_value = [MagicMock(**{
            "__getitem__": lambda self, key: {
                "spend": "19200", "impressions": "3412", "clicks": "68",
                "ctr": "1.99", "cpc": "282.35", "cpm": "5628.0",
                "actions": [{"action_type": "offsite_conversion", "value": "3"}],
                "cost_per_action_type": [{"action_type": "offsite_conversion", "value": "6400"}],
                "action_values": [{"action_type": "offsite_conversion", "value": "0"}],
            }.get(key, "0"),
            "get": lambda self, key, default=None: {
                "spend": "19200", "impressions": "3412", "clicks": "68",
                "ctr": "1.99", "cpc": "282.35", "cpm": "5628.0",
            }.get(key, default),
        })]
        mock_get_account.return_value = mock_account

        result = fetch_daily("brandrise", "2026-03-14", config_path=sample_config)
        assert "spend" in result
        assert "ctr" in result
        assert "roas" in result


class TestSaveAndLoadInsights:
    def test_save_and_load(self, data_dir, sample_daily_insights):
        save_insights("brandrise", sample_daily_insights, "2026-03-14", data_dir=data_dir)
        loaded = load_insights("brandrise", "2026-03-14", data_dir=data_dir)
        assert loaded["spend"] == 19200
        assert loaded["date"] == "2026-03-14"

    def test_load_nonexistent_returns_none(self, data_dir):
        result = load_insights("brandrise", "2099-01-01", data_dir=data_dir)
        assert result is None


class TestFetchRange:
    def test_loads_from_local(self, data_dir, sample_daily_insights, sample_yesterday_insights):
        save_insights("brandrise", sample_yesterday_insights, "2026-03-13", data_dir=data_dir)
        save_insights("brandrise", sample_daily_insights, "2026-03-14", data_dir=data_dir)
        result = fetch_range("brandrise", "2026-03-13", "2026-03-14", data_dir=data_dir)
        assert len(result) == 2
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_insights_fetcher.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: insights_fetcher.py 구현**

```python
# scripts/meta/insights_fetcher.py
"""Meta Insights API에서 성과 데이터를 수집하고 로컬 JSON으로 저장."""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from meta.auth import get_account, load_config

BASE_DIR = Path(__file__).parent.parent.parent  # worktree root
DEFAULT_DATA_DIR = BASE_DIR / "data"

METRICS_FIELDS = [
    "spend", "impressions", "clicks", "ctr", "cpc", "cpm",
    "actions", "cost_per_action_type", "action_values",
]


def _parse_actions(raw: list[dict] | None, action_type: str = "offsite_conversion") -> float:
    """actions 배열에서 특정 action_type의 value 추출."""
    if not raw:
        return 0.0
    for action in raw:
        if action.get("action_type") == action_type:
            return float(action.get("value", 0))
    return 0.0


def _parse_insights(raw_row: dict) -> dict:
    """API 응답 1행을 정제된 metrics dict로 변환."""
    spend = float(raw_row.get("spend", 0))
    conversions = _parse_actions(raw_row.get("actions"))
    revenue = _parse_actions(raw_row.get("action_values"))

    return {
        "spend": round(spend),
        "impressions": int(raw_row.get("impressions", 0)),
        "clicks": int(raw_row.get("clicks", 0)),
        "ctr": round(float(raw_row.get("ctr", 0)), 2),
        "cpc": round(float(raw_row.get("cpc", 0))),
        "cpm": round(float(raw_row.get("cpm", 0))),
        "conversions": int(conversions),
        "cpa": round(spend / conversions) if conversions > 0 else 0,
        "roas": round(revenue / spend, 1) if spend > 0 else 0.0,
    }


def fetch_daily(
    account_key: str,
    date_str: str,
    config_path: Path | None = None,
    data_dir: Path | None = None,
) -> dict:
    """특정 날짜의 계정 전체 성과를 수집하고 로컬에 저장."""
    account = get_account(account_key, config_path)
    params = {
        "time_range": {"since": date_str, "until": date_str},
        "fields": METRICS_FIELDS,
        "level": "account",
    }
    rows = account.get_insights(params=params)
    if not rows:
        return {"date": date_str, "account_key": account_key, "spend": 0,
                "impressions": 0, "clicks": 0, "ctr": 0, "cpc": 0, "cpm": 0,
                "conversions": 0, "cpa": 0, "roas": 0.0}

    result = _parse_insights(rows[0])
    result["date"] = date_str
    result["account_key"] = account_key

    save_insights(account_key, result, date_str, data_dir=data_dir)
    return result


def _fetch_breakdown(
    account_key: str,
    date_str: str,
    level: str,
    extra_fields: list[str],
    config_path: Path | None = None,
    parent_id: str | None = None,
) -> list[dict]:
    """공통 브레이크다운 조회. level: campaign/adset/ad."""
    if parent_id and level in ("adset", "ad"):
        from facebook_business.adobjects.campaign import Campaign as CampaignObj
        from facebook_business.adobjects.adset import AdSet as AdSetObj
        parent_cls = CampaignObj if level == "adset" else AdSetObj
        parent = parent_cls(parent_id)
        params = {
            "time_range": {"since": date_str, "until": date_str},
            "fields": METRICS_FIELDS + extra_fields,
        }
        rows = parent.get_insights(params=params)
    else:
        account = get_account(account_key, config_path)
        params = {
            "time_range": {"since": date_str, "until": date_str},
            "fields": METRICS_FIELDS + extra_fields,
            "level": level,
        }
        rows = account.get_insights(params=params)

    return [{**_parse_insights(row), **{f: row.get(f, "") for f in extra_fields},
             "date": date_str} for row in rows]


def fetch_by_campaign(account_key: str, date_str: str, config_path: Path | None = None) -> list[dict]:
    """캠페인별 성과 브레이크다운."""
    return _fetch_breakdown(account_key, date_str, "campaign",
                            ["campaign_id", "campaign_name"], config_path)


def fetch_by_adset(campaign_id: str, date_str: str, account_key: str = "", config_path: Path | None = None) -> list[dict]:
    """광고세트별 성과 브레이크다운."""
    return _fetch_breakdown(account_key, date_str, "adset",
                            ["adset_id", "adset_name"], config_path, parent_id=campaign_id)


def fetch_by_ad(adset_id: str, date_str: str, account_key: str = "", config_path: Path | None = None) -> list[dict]:
    """광고별 성과 브레이크다운."""
    return _fetch_breakdown(account_key, date_str, "ad",
                            ["ad_id", "ad_name"], config_path, parent_id=adset_id)


def save_insights(
    account_key: str,
    data: dict,
    date_str: str,
    data_dir: Path | None = None,
) -> Path:
    """성과 데이터를 로컬 JSON으로 저장."""
    base = data_dir or DEFAULT_DATA_DIR
    account_dir = base / account_key
    account_dir.mkdir(parents=True, exist_ok=True)
    file_path = account_dir / f"{date_str}.json"
    file_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return file_path


def load_insights(
    account_key: str,
    date_str: str,
    data_dir: Path | None = None,
) -> dict | None:
    """로컬 JSON에서 성과 데이터 로드. 없으면 None."""
    base = data_dir or DEFAULT_DATA_DIR
    file_path = base / account_key / f"{date_str}.json"
    if not file_path.exists():
        return None
    return json.loads(file_path.read_text(encoding="utf-8"))


def fetch_range(
    account_key: str,
    since: str,
    until: str,
    data_dir: Path | None = None,
) -> list[dict]:
    """기간별 성과 데이터 로드 (로컬 우선, 없으면 빈 리스트)."""
    base = data_dir or DEFAULT_DATA_DIR
    start = datetime.strptime(since, "%Y-%m-%d").date()
    end = datetime.strptime(until, "%Y-%m-%d").date()
    results = []
    current = start
    while current <= end:
        data = load_insights(account_key, current.isoformat(), data_dir=base)
        if data:
            results.append(data)
        current += timedelta(days=1)
    return results
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_insights_fetcher.py -v
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/meta/insights_fetcher.py tests/meta/test_insights_fetcher.py
git commit -m "feat: insights_fetcher — Meta 성과 데이터 수집 및 로컬 JSON 저장"
```

---

### Task 4: performance_analyzer.py — 성과 비교 및 이상 감지

**Files:**
- Create: `scripts/meta/performance_analyzer.py`
- Create: `tests/meta/test_performance_analyzer.py`

- [ ] **Step 1: 테스트 작성**

```python
# tests/meta/test_performance_analyzer.py
import pytest
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from meta.performance_analyzer import compare_daily, detect_anomalies, weekly_trend
from meta.insights_fetcher import save_insights


class TestCompareDaily:
    def test_calculates_change_percent(self, sample_daily_insights, sample_yesterday_insights, data_dir):
        save_insights("brandrise", sample_yesterday_insights, "2026-03-13", data_dir=data_dir)
        save_insights("brandrise", sample_daily_insights, "2026-03-14", data_dir=data_dir)

        result = compare_daily("brandrise", "2026-03-14", data_dir=data_dir)
        assert "metrics" in result
        # CTR: 1.99 vs 1.78 → +11.8%
        assert result["metrics"]["ctr"]["change"] > 0
        # CPC: 282 vs 325 → -13.2%
        assert result["metrics"]["cpc"]["change"] < 0

    def test_no_yesterday_data_returns_no_change(self, sample_daily_insights, data_dir):
        save_insights("brandrise", sample_daily_insights, "2026-03-14", data_dir=data_dir)
        result = compare_daily("brandrise", "2026-03-14", data_dir=data_dir)
        assert all(m["change"] == 0 for m in result["metrics"].values())


class TestDetectAnomalies:
    def test_ctr_drop_alert(self, data_dir):
        yesterday = {"date": "2026-03-13", "spend": 20000, "ctr": 3.0,
                      "cpc": 300, "cpa": 5000, "roas": 0, "impressions": 3000,
                      "clicks": 90, "cpm": 6000, "conversions": 4}
        today = {"date": "2026-03-14", "spend": 20000, "ctr": 1.5,
                  "cpc": 300, "cpa": 5000, "roas": 0, "impressions": 3000,
                  "clicks": 45, "cpm": 6000, "conversions": 4}
        save_insights("brandrise", yesterday, "2026-03-13", data_dir=data_dir)
        save_insights("brandrise", today, "2026-03-14", data_dir=data_dir)

        thresholds = {"ctr_drop": 30, "cpa_spike": 50, "budget_under": 80}
        alerts = detect_anomalies("brandrise", "2026-03-14",
                                   thresholds=thresholds, data_dir=data_dir)
        assert any("CTR" in a["message"] for a in alerts)

    def test_no_anomaly(self, sample_daily_insights, sample_yesterday_insights, data_dir):
        save_insights("brandrise", sample_yesterday_insights, "2026-03-13", data_dir=data_dir)
        save_insights("brandrise", sample_daily_insights, "2026-03-14", data_dir=data_dir)

        thresholds = {"ctr_drop": 30, "cpa_spike": 50, "budget_under": 80}
        alerts = detect_anomalies("brandrise", "2026-03-14",
                                   thresholds=thresholds, data_dir=data_dir)
        assert len(alerts) == 0

    def test_budget_under_alert(self, data_dir, sample_config):
        """예산 소진율 80% 미만 시 경고."""
        today = {"date": "2026-03-14", "spend": 15000, "ctr": 2.0,
                 "cpc": 300, "cpa": 5000, "roas": 0, "impressions": 3000,
                 "clicks": 60, "cpm": 5000, "conversions": 3}
        yesterday = {"date": "2026-03-13", "spend": 18000, "ctr": 2.0,
                     "cpc": 300, "cpa": 6000, "roas": 0, "impressions": 3000,
                     "clicks": 60, "cpm": 6000, "conversions": 3}
        save_insights("brandrise", yesterday, "2026-03-13", data_dir=data_dir)
        save_insights("brandrise", today, "2026-03-14", data_dir=data_dir)

        # daily_budget_alert=50000이면 15000/50000=30% → 80% 미만 경고
        thresholds = {"ctr_drop": 30, "cpa_spike": 50, "budget_under": 80}
        alerts = detect_anomalies("brandrise", "2026-03-14",
                                   thresholds=thresholds, data_dir=data_dir,
                                   config_path=sample_config)
        assert any(a["type"] == "budget_under" for a in alerts)


class TestWeeklyTrend:
    def test_returns_7_days(self, data_dir):
        for i in range(7):
            d = f"2026-03-{8+i:02d}"
            data = {"date": d, "spend": 20000, "ctr": 1.5 + i * 0.1,
                    "cpa": 5000, "roas": 1.0, "impressions": 3000,
                    "clicks": 50, "cpc": 400, "cpm": 6000, "conversions": 4}
            save_insights("brandrise", data, d, data_dir=data_dir)

        result = weekly_trend("brandrise", end_date="2026-03-14", data_dir=data_dir)
        assert len(result["trend"]) == 7
        assert "summary" in result
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_performance_analyzer.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: performance_analyzer.py 구현**

```python
# scripts/meta/performance_analyzer.py
"""성과 비교 및 이상 징후 감지."""
from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

from meta.insights_fetcher import load_insights

COMPARE_METRICS = ["spend", "impressions", "clicks", "ctr", "cpc", "cpm",
                   "conversions", "cpa", "roas"]


def _pct_change(today_val: float, yesterday_val: float) -> float:
    """전일 대비 변화율 (%) 계산."""
    if yesterday_val == 0:
        return 0.0
    return round((today_val - yesterday_val) / yesterday_val * 100, 1)


def compare_daily(
    account_key: str,
    date_str: str,
    data_dir: Path | None = None,
) -> dict:
    """전일 대비 성과 비교."""
    today_data = load_insights(account_key, date_str, data_dir=data_dir)
    if not today_data:
        return {"metrics": {}, "alerts": []}

    yesterday = (datetime.strptime(date_str, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
    yesterday_data = load_insights(account_key, yesterday, data_dir=data_dir)

    metrics = {}
    for key in COMPARE_METRICS:
        today_val = today_data.get(key, 0)
        yesterday_val = yesterday_data.get(key, 0) if yesterday_data else 0
        metrics[key] = {
            "today": today_val,
            "yesterday": yesterday_val,
            "change": _pct_change(today_val, yesterday_val),
        }

    return {"metrics": metrics, "alerts": []}


def detect_anomalies(
    account_key: str,
    date_str: str,
    thresholds: dict | None = None,
    data_dir: Path | None = None,
    config_path: Path | None = None,
) -> list[dict]:
    """이상 징후 감지. thresholds: {ctr_drop, cpa_spike, budget_under}."""
    if not thresholds:
        thresholds = {"ctr_drop": 30, "cpa_spike": 50, "budget_under": 80}

    comparison = compare_daily(account_key, date_str, data_dir=data_dir)
    if not comparison["metrics"]:
        return []

    alerts = []
    ctr_change = comparison["metrics"].get("ctr", {}).get("change", 0)
    if ctr_change < -thresholds["ctr_drop"]:
        alerts.append({
            "type": "ctr_drop",
            "value": ctr_change,
            "message": f"CTR {abs(ctr_change)}% 하락 — 소재 피로도 체크",
        })

    cpa_change = comparison["metrics"].get("cpa", {}).get("change", 0)
    if cpa_change > thresholds["cpa_spike"]:
        alerts.append({
            "type": "cpa_spike",
            "value": cpa_change,
            "message": f"CPA {cpa_change}% 상승 — 타겟/소재 점검",
        })

    # 예산 소진율 체크
    today_data = load_insights(account_key, date_str, data_dir=data_dir)
    if today_data:
        spend = today_data.get("spend", 0)
        # daily_budget_alert를 일예산 기준으로 사용
        config = load_config(config_path)
        daily_budget = config.get("accounts", {}).get(account_key, {}).get("daily_budget_alert", 0)
        if daily_budget > 0:
            utilization = round(spend / daily_budget * 100, 1)
            if utilization < thresholds.get("budget_under", 80):
                alerts.append({
                    "type": "budget_under",
                    "value": utilization,
                    "message": f"예산 소진율 {utilization}% — 타겟 확대 검토",
                })

    return alerts


def weekly_trend(
    account_key: str,
    end_date: str | None = None,
    data_dir: Path | None = None,
) -> dict:
    """최근 7일 트렌드."""
    if not end_date:
        end_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    trend = []
    for i in range(6, -1, -1):
        d = (end - timedelta(days=i)).isoformat()
        data = load_insights(account_key, d, data_dir=data_dir)
        if data:
            trend.append({
                "date": d,
                "spend": data.get("spend", 0),
                "ctr": data.get("ctr", 0),
                "cpa": data.get("cpa", 0),
                "roas": data.get("roas", 0),
            })

    summary = _generate_summary(trend) if trend else "데이터 부족"
    return {"trend": trend, "summary": summary}


def _generate_summary(trend: list[dict]) -> str:
    """트렌드 요약 문장 생성."""
    if len(trend) < 2:
        return "데이터 부족"

    parts = []
    first, last = trend[0], trend[-1]

    if last["cpa"] > 0 and first["cpa"] > 0:
        cpa_change = _pct_change(last["cpa"], first["cpa"])
        direction = "하락 (좋음)" if cpa_change < 0 else "상승 (주의)"
        parts.append(f"CPA {direction}")

    if last["ctr"] > 0 and first["ctr"] > 0:
        ctr_change = _pct_change(last["ctr"], first["ctr"])
        direction = "상승 (좋음)" if ctr_change > 0 else "하락 (주의)"
        parts.append(f"CTR {direction}")

    return ", ".join(parts) if parts else "변동 없음"
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_performance_analyzer.py -v
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/meta/performance_analyzer.py tests/meta/test_performance_analyzer.py
git commit -m "feat: performance_analyzer — 전일 비교, 주간 트렌드, 이상 징후 감지"
```

---

## Chunk 3: 데일리 보고 + 캠페인 관리

### Task 5: daily_reporter.py — 데일리 보고 + Slack 발송

**Files:**
- Create: `scripts/meta/daily_reporter.py`
- Create: `tests/meta/test_daily_reporter.py`

- [ ] **Step 1: 테스트 작성**

```python
# tests/meta/test_daily_reporter.py
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from meta.daily_reporter import (
    format_account_block, format_summary, send_to_slack, run_daily_report,
)


class TestFormatAccountBlock:
    def test_includes_account_name_and_metrics(self, sample_daily_insights):
        comparison = {
            "metrics": {
                "ctr": {"today": 1.99, "yesterday": 1.78, "change": 11.8},
                "cpc": {"today": 282, "yesterday": 325, "change": -13.2},
                "roas": {"today": 0.0, "yesterday": 0.0, "change": 0},
                "spend": {"today": 19200, "yesterday": 18500, "change": 3.8},
                "impressions": {"today": 3412, "yesterday": 3200, "change": 6.6},
                "clicks": {"today": 68, "yesterday": 57, "change": 19.3},
                "conversions": {"today": 3, "yesterday": 2, "change": 50},
                "cpa": {"today": 6400, "yesterday": 9250, "change": -30.8},
            },
        }
        block = format_account_block("브랜드라이즈", sample_daily_insights, comparison, [])
        assert "브랜드라이즈" in block
        assert "CTR" in block
        assert "ROAS" in block
        assert "₩" in block

    def test_includes_anomaly_alerts(self, sample_daily_insights):
        comparison = {"metrics": {
            k: {"today": 0, "yesterday": 0, "change": 0}
            for k in ["ctr", "cpc", "roas", "spend", "impressions", "clicks", "conversions", "cpa"]
        }}
        alerts = [{"type": "cpa_spike", "value": 62, "message": "CPA 62% 급등"}]
        block = format_account_block("테스트", sample_daily_insights, comparison, alerts)
        assert "CPA 62%" in block


class TestFormatSummary:
    def test_includes_totals(self):
        accounts_data = [
            {"name": "A", "insights": {"spend": 19200, "conversions": 3, "roas": 0.0},
             "anomalies": []},
            {"name": "B", "insights": {"spend": 45000, "conversions": 5, "roas": 3.2},
             "anomalies": [{"type": "cpa_spike"}]},
        ]
        summary = format_summary(accounts_data)
        assert "계정 2개" in summary
        assert "전환 8건" in summary


class TestRunDailyReport:
    @patch("meta.daily_reporter.send_to_slack")
    @patch("meta.daily_reporter.detect_anomalies")
    @patch("meta.daily_reporter.compare_daily")
    @patch("meta.daily_reporter.fetch_daily")
    @patch("meta.daily_reporter.validate_token")
    def test_orchestrates_all_accounts(self, mock_validate, mock_fetch, mock_compare,
                                        mock_anomalies, mock_slack, sample_config):
        mock_validate.return_value = True
        mock_fetch.return_value = {"spend": 19200, "impressions": 3412, "clicks": 68,
                                    "ctr": 1.99, "cpc": 282, "conversions": 3, "cpa": 6400, "roas": 0.0}
        mock_compare.return_value = {"metrics": {
            k: {"today": 0, "yesterday": 0, "change": 0}
            for k in ["ctr", "cpc", "roas", "spend", "impressions", "clicks", "conversions", "cpa"]
        }}
        mock_anomalies.return_value = []
        mock_slack.return_value = True

        report = run_daily_report(date_str="2026-03-14", config_path=sample_config)
        assert "브랜드라이즈" in report
        assert "클라이언트 A" in report
        assert mock_fetch.call_count == 2  # 2 accounts

    @patch("meta.daily_reporter.send_to_slack")
    @patch("meta.daily_reporter.validate_token")
    def test_invalid_token_sends_error(self, mock_validate, mock_slack, sample_config):
        mock_validate.return_value = False
        mock_slack.return_value = True
        report = run_daily_report(date_str="2026-03-14", config_path=sample_config)
        assert "토큰" in report
        mock_slack.assert_called_once()

    @patch("meta.daily_reporter.send_to_slack")
    @patch("meta.daily_reporter.detect_anomalies")
    @patch("meta.daily_reporter.compare_daily")
    @patch("meta.daily_reporter.fetch_daily")
    @patch("meta.daily_reporter.validate_token")
    def test_single_account_failure_continues(self, mock_validate, mock_fetch, mock_compare,
                                               mock_anomalies, mock_slack, sample_config):
        """한 계정 실패해도 나머지 정상 보고."""
        mock_validate.return_value = True
        mock_fetch.side_effect = [Exception("API error"), {"spend": 45000, "impressions": 8200,
            "clicks": 156, "ctr": 1.9, "cpc": 288, "conversions": 5, "cpa": 9000, "roas": 3.2}]
        mock_compare.return_value = {"metrics": {
            k: {"today": 0, "yesterday": 0, "change": 0}
            for k in ["ctr", "cpc", "roas", "spend", "impressions", "clicks", "conversions", "cpa"]
        }}
        mock_anomalies.return_value = []
        mock_slack.return_value = True

        report = run_daily_report(date_str="2026-03-14", config_path=sample_config)
        assert "오류" in report
        assert "클라이언트 A" in report


class TestSendToSlack:
    @patch("meta.daily_reporter.requests.post")
    def test_sends_webhook(self, mock_post, monkeypatch):
        monkeypatch.setenv("SLACK_WEBHOOK_URL", "https://hooks.slack.com/test")
        mock_post.return_value = MagicMock(status_code=200)
        result = send_to_slack("test message")
        assert result is True
        mock_post.assert_called_once()

    def test_missing_webhook_returns_false(self, monkeypatch):
        monkeypatch.delenv("SLACK_WEBHOOK_URL", raising=False)
        result = send_to_slack("test")
        assert result is False
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_daily_reporter.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: daily_reporter.py 구현**

```python
# scripts/meta/daily_reporter.py
"""데일리 보고 생성 + Slack Webhook 발송. Cron 진입점."""
from __future__ import annotations

import argparse
import json
import logging
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

import requests

from meta.auth import load_config, validate_token
from meta.insights_fetcher import fetch_daily, save_insights, load_insights
from meta.performance_analyzer import compare_daily, detect_anomalies

logger = logging.getLogger(__name__)

CONFIG_DIR = Path(__file__).parent


def format_account_block(
    account_name: str,
    insights: dict,
    comparison: dict,
    anomalies: list[dict],
) -> str:
    """계정별 보고 블록 포맷팅."""
    metrics = comparison.get("metrics", {})

    def _fmt_change(key: str) -> str:
        change = metrics.get(key, {}).get("change", 0)
        if change == 0:
            return ""
        sign = "+" if change > 0 else ""
        return f" ({sign}{change}%)"

    roas = insights.get("roas", 0)
    roas_str = f"ROAS {roas}x{_fmt_change('roas')}"

    lines = [
        f"[{account_name}]",
        f"지출 ₩{insights.get('spend', 0):,}{_fmt_change('spend')}  |  "
        f"노출 {insights.get('impressions', 0):,}  |  "
        f"클릭 {insights.get('clicks', 0):,}",
        f"CTR {insights.get('ctr', 0)}%{_fmt_change('ctr')}  |  "
        f"CPC ₩{insights.get('cpc', 0):,}{_fmt_change('cpc')}  |  "
        f"{roas_str}",
        f"전환 {insights.get('conversions', 0)}건  |  "
        f"CPA ₩{insights.get('cpa', 0):,}{_fmt_change('cpa')}",
    ]

    for alert in anomalies:
        lines.append(f">> 주의: {alert['message']}")

    return "\n".join(lines)


def format_summary(all_accounts_data: list[dict]) -> str:
    """전체 요약 블록."""
    total_spend = sum(a["insights"].get("spend", 0) for a in all_accounts_data)
    total_conversions = sum(a["insights"].get("conversions", 0) for a in all_accounts_data)
    total_roas_num = sum(a["insights"].get("spend", 0) * a["insights"].get("roas", 0)
                         for a in all_accounts_data)
    avg_roas = round(total_roas_num / total_spend, 1) if total_spend > 0 else 0.0

    num_accounts = len(all_accounts_data)
    num_warning = sum(1 for a in all_accounts_data if a["anomalies"])
    num_ok = num_accounts - num_warning

    return (
        f"───────────────────────────\n"
        f"전체: 계정 {num_accounts}개 | "
        f"지출 ₩{total_spend:,} | "
        f"전환 {total_conversions}건 | "
        f"ROAS {avg_roas}x\n"
        f"정상 {num_ok} | 주의 {num_warning} | 긴급 0"
    )


def send_to_slack(message: str) -> bool:
    """Slack Webhook으로 메시지 발송."""
    webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        logger.error("SLACK_WEBHOOK_URL 환경변수 없음")
        return False

    try:
        resp = requests.post(
            webhook_url,
            json={"text": message},
            timeout=10,
        )
        return resp.status_code == 200
    except requests.RequestException as e:
        logger.error(f"Slack 발송 실패: {e}")
        return False


def run_daily_report(
    date_str: str | None = None,
    account_filter: str | None = None,
    config_path: Path | None = None,
) -> str:
    """메인 실행. 전체 계정 순회 → 보고서 생성 → Slack 발송."""
    if not date_str:
        date_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    config = load_config(config_path or CONFIG_DIR / "config.yaml")
    thresholds = config.get("report", {}).get("alert_thresholds", {})

    # 토큰 검증
    if not validate_token():
        error_msg = f"[Meta 광고 오류] 토큰 유효성 검사 실패 — {date_str}"
        send_to_slack(error_msg)
        return error_msg

    weekday = ["월", "화", "수", "목", "금", "토", "일"]
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    header = f"Meta 광고 데일리 — {date_str} ({weekday[dt.weekday()]})\n"

    all_accounts_data = []
    accounts = config["accounts"]
    if account_filter:
        accounts = {k: v for k, v in accounts.items() if k == account_filter}

    for account_key, account_info in accounts.items():
        for attempt in range(3):  # rate limit 재시도 최대 3회
            try:
                insights = fetch_daily(account_key, date_str, config_path=config_path)
                comparison = compare_daily(account_key, date_str)
                anomalies = detect_anomalies(account_key, date_str, thresholds=thresholds,
                                             config_path=config_path or CONFIG_DIR / "config.yaml")

                block = format_account_block(account_info["name"], insights, comparison, anomalies)
                all_accounts_data.append({
                    "name": account_info["name"],
                    "insights": insights,
                    "anomalies": anomalies,
                    "block": block,
                })
                break  # 성공 시 재시도 루프 탈출
            except Exception as e:
                if "rate limit" in str(e).lower() and attempt < 2:
                    logger.warning(f"계정 {account_key} rate limit, {attempt+1}/3 재시도...")
                    time.sleep(5)
                    continue
                logger.error(f"계정 {account_key} 처리 실패: {e}")
                all_accounts_data.append({
                    "name": account_info["name"],
                    "insights": {"spend": 0, "conversions": 0, "roas": 0},
                    "anomalies": [],
                    "block": f"[{account_info['name']}]\n>> 오류: {e}",
                })
                break
        time.sleep(2)  # 계정 간 rate limit 방지

    # 90일 초과 데이터 정리
    _cleanup_old_data(config)

    body = "\n\n".join(a["block"] for a in all_accounts_data)
    summary = format_summary(all_accounts_data)
    full_message = f"{header}\n{body}\n\n{summary}"

    send_to_slack(full_message)
    return full_message


def _cleanup_old_data(config: dict, retention_days: int = 90) -> None:
    """90일 초과 일별 JSON 파일 삭제."""
    from meta.insights_fetcher import DEFAULT_DATA_DIR
    cutoff = datetime.now() - timedelta(days=retention_days)
    for account_key in config.get("accounts", {}):
        account_dir = DEFAULT_DATA_DIR / account_key
        if not account_dir.exists():
            continue
        for f in account_dir.glob("????-??-??.json"):
            try:
                file_date = datetime.strptime(f.stem, "%Y-%m-%d")
                if file_date < cutoff:
                    f.unlink()
                    logger.info(f"삭제: {f}")
            except ValueError:
                continue


def main():
    parser = argparse.ArgumentParser(description="Meta 광고 데일리 리포트")
    parser.add_argument("--date", help="보고 날짜 (YYYY-MM-DD, 기본: 어제)")
    parser.add_argument("--account", help="특정 계정만 보고")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    try:
        report = run_daily_report(date_str=args.date, account_filter=args.account)
        print(report)
    except Exception as e:
        error_msg = f"[Meta 광고 오류] 데일리 리포트 실패: {e}"
        logger.error(error_msg)
        send_to_slack(error_msg)
        raise


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_daily_reporter.py -v
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/meta/daily_reporter.py tests/meta/test_daily_reporter.py
git commit -m "feat: daily_reporter — Slack 데일리 보고 + Cron 진입점"
```

---

### Task 6: campaign_manager.py — 캠페인 CRUD

**Files:**
- Create: `scripts/meta/campaign_manager.py`
- Create: `tests/meta/test_campaign_manager.py`

- [ ] **Step 1: 테스트 작성**

```python
# tests/meta/test_campaign_manager.py
import pytest
import json
from unittest.mock import patch, MagicMock
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "scripts"))

from meta.campaign_manager import (
    create_campaign, create_adset, create_ad,
    toggle_status, update_budget, list_campaigns,
    _check_budget_limit, _log_action,
)


class TestBudgetLimit:
    def test_within_limit(self, sample_config):
        # brandrise limit: 50000
        _check_budget_limit("brandrise", 30000, config_path=sample_config)  # should not raise

    def test_exceeds_limit(self, sample_config):
        with pytest.raises(ValueError, match="예산 상한 초과"):
            _check_budget_limit("brandrise", 60000, config_path=sample_config)


class TestLogAction:
    def test_saves_log(self, tmp_path):
        _log_action("create_campaign", {"id": "123", "name": "test"}, log_dir=tmp_path)
        logs = list(tmp_path.glob("*.json"))
        assert len(logs) == 1
        data = json.loads(logs[0].read_text())
        assert data["action"] == "create_campaign"


class TestCreateCampaign:
    @patch("meta.campaign_manager.get_account")
    def test_creates_paused_campaign(self, mock_get_account, sample_config, monkeypatch, tmp_path):
        monkeypatch.setenv("META_ACCESS_TOKEN", "test_token")
        mock_account = MagicMock()
        mock_campaign = MagicMock()
        mock_campaign.__getitem__ = lambda self, key: {"id": "camp_123"}.get(key)
        mock_account.create_campaign.return_value = mock_campaign
        mock_get_account.return_value = mock_account

        result = create_campaign(
            "brandrise", "테스트 캠페인", "OUTCOME_TRAFFIC",
            daily_budget=20000, config_path=sample_config, log_dir=tmp_path,
        )
        assert result == "camp_123"
        # PAUSED 상태로 생성되었는지 확인
        call_args = mock_account.create_campaign.call_args
        assert call_args[1]["params"]["status"] == "PAUSED"


class TestCreateAdset:
    @patch("meta.campaign_manager.get_account")
    def test_creates_paused_adset(self, mock_get_account, sample_config, monkeypatch, tmp_path):
        monkeypatch.setenv("META_ACCESS_TOKEN", "test_token")
        mock_account = MagicMock()
        mock_adset = MagicMock()
        mock_adset.__getitem__ = lambda self, key: {"id": "adset_456"}.get(key)
        mock_account.create_ad_set.return_value = mock_adset
        mock_get_account.return_value = mock_account

        result = create_adset(
            "camp_123", "테스트 광고세트", targeting={"age_min": 25, "age_max": 45},
            daily_budget=10000, account_key="brandrise", config_path=sample_config, log_dir=tmp_path,
        )
        assert result == "adset_456"
        call_args = mock_account.create_ad_set.call_args
        assert call_args[1]["params"]["status"] == "PAUSED"


class TestToggleStatus:
    @patch("meta.campaign_manager.Campaign")
    def test_toggle_to_active(self, mock_campaign_cls, tmp_path):
        mock_obj = MagicMock()
        mock_campaign_cls.return_value = mock_obj
        toggle_status("camp_123", "campaign", "ACTIVE", log_dir=tmp_path)
        mock_obj.api_update.assert_called_once()


class TestUpdateBudget:
    @patch("meta.campaign_manager.AdSet")
    def test_updates_budget(self, mock_adset_cls, tmp_path):
        mock_obj = MagicMock()
        mock_adset_cls.return_value = mock_obj
        update_budget("adset_456", 15000, log_dir=tmp_path)
        mock_obj.api_update.assert_called_once()

    def test_exceeds_limit_raises(self, sample_config):
        with pytest.raises(ValueError, match="예산 상한 초과"):
            update_budget("adset_456", 60000, account_key="brandrise", config_path=sample_config)


class TestListCampaigns:
    @patch("meta.campaign_manager.get_account")
    def test_returns_campaign_list(self, mock_get_account, sample_config, monkeypatch):
        monkeypatch.setenv("META_ACCESS_TOKEN", "test_token")
        mock_account = MagicMock()
        mock_account.get_campaigns.return_value = [
            {"id": "camp_1", "name": "캠페인 A", "status": "ACTIVE",
             "daily_budget": "2000000", "objective": "OUTCOME_TRAFFIC"},
        ]
        mock_get_account.return_value = mock_account

        result = list_campaigns("brandrise", config_path=sample_config)
        assert len(result) == 1
        assert result[0]["daily_budget"] == 20000  # cents → 원 변환
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_campaign_manager.py -v
```

Expected: ModuleNotFoundError

- [ ] **Step 3: campaign_manager.py 구현**

```python
# scripts/meta/campaign_manager.py
"""캠페인/광고세트/광고 CRUD + 안전장치."""
from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

from meta.auth import load_config, get_account

try:
    from facebook_business.adobjects.campaign import Campaign
    from facebook_business.adobjects.adset import AdSet
    from facebook_business.adobjects.ad import Ad
    from facebook_business.adobjects.adcreative import AdCreative
    from facebook_business.adobjects.adimage import AdImage
except ImportError:
    Campaign = AdSet = Ad = AdCreative = AdImage = None

logger = logging.getLogger(__name__)

CONFIG_DIR = Path(__file__).parent
DEFAULT_LOG_DIR = Path(__file__).parent.parent.parent / "logs" / "actions"


def _check_budget_limit(
    account_key: str,
    daily_budget: int,
    config_path: Path | None = None,
) -> None:
    """config의 일예산 상한 초과 시 에러."""
    config = load_config(config_path)
    limit = config["accounts"][account_key].get("daily_budget_alert", float("inf"))
    if daily_budget > limit:
        raise ValueError(
            f"예산 상한 초과: ₩{daily_budget:,} > ₩{limit:,} (계정: {account_key})"
        )


def _log_action(
    action: str,
    data: dict,
    log_dir: Path | None = None,
) -> None:
    """모든 생성/변경을 JSON 로그로 저장."""
    base = log_dir or DEFAULT_LOG_DIR
    base.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = base / f"{timestamp}_{action}.json"
    log_file.write_text(
        json.dumps({"action": action, "timestamp": timestamp, **data},
                    ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def create_campaign(
    account_key: str,
    name: str,
    objective: str,
    daily_budget: int = 20000,
    schedule: dict | None = None,
    dry_run: bool = False,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """캠페인 생성. 항상 PAUSED 상태로 생성."""
    _check_budget_limit(account_key, daily_budget, config_path=config_path)

    params = {
        "name": name,
        "objective": objective,
        "status": "PAUSED",
        "special_ad_categories": [],
        "daily_budget": daily_budget * 100,  # Meta API는 cents 단위
    }
    if schedule:
        params.update(schedule)

    if dry_run:
        logger.info(f"[DRY RUN] create_campaign: {params}")
        _log_action("create_campaign_dry", params, log_dir=log_dir)
        return "dry_run_campaign_id"

    account = get_account(account_key, config_path)
    campaign = account.create_campaign(params=params)
    campaign_id = campaign["id"]

    _log_action("create_campaign", {"campaign_id": campaign_id, **params}, log_dir=log_dir)
    logger.info(f"캠페인 생성: {campaign_id} ({name})")
    return campaign_id


def create_adset(
    campaign_id: str,
    name: str,
    targeting: dict,
    placements: dict | None = None,
    daily_budget: int = 10000,
    account_key: str = "",
    dry_run: bool = False,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """광고세트 생성."""
    params = {
        "campaign_id": campaign_id,
        "name": name,
        "targeting": targeting,
        "daily_budget": daily_budget * 100,
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "LINK_CLICKS",
        "status": "PAUSED",
    }
    if placements:
        params["targeting"]["publisher_platforms"] = placements.get("platforms", ["instagram"])

    if dry_run:
        logger.info(f"[DRY RUN] create_adset: {params}")
        _log_action("create_adset_dry", params, log_dir=log_dir)
        return "dry_run_adset_id"

    account = get_account(account_key, config_path)
    adset = account.create_ad_set(params=params)
    adset_id = adset["id"]

    _log_action("create_adset", {"adset_id": adset_id, **params}, log_dir=log_dir)
    return adset_id


def create_ad(
    adset_id: str,
    name: str,
    creative_id: str,
    status: str = "PAUSED",
    account_key: str = "",
    dry_run: bool = False,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """광고 생성. 기본 PAUSED."""
    params = {
        "adset_id": adset_id,
        "name": name,
        "creative": {"creative_id": creative_id},
        "status": status,
    }

    if dry_run:
        logger.info(f"[DRY RUN] create_ad: {params}")
        _log_action("create_ad_dry", params, log_dir=log_dir)
        return "dry_run_ad_id"

    account = get_account(account_key, config_path)
    ad = account.create_ad(params=params)
    ad_id = ad["id"]

    _log_action("create_ad", {"ad_id": ad_id, **params}, log_dir=log_dir)
    return ad_id


def upload_creative(
    account_key: str,
    image_path: str,
    name: str,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """이미지 업로드 → AdCreative 생성 → creative_id 반환."""
    account = get_account(account_key, config_path)

    # 이미지 업로드
    image = AdImage(parent_id=account["id"])
    image[AdImage.Field.filename] = image_path
    image.remote_create()
    image_hash = image[AdImage.Field.hash]

    # AdCreative 생성
    creative = account.create_ad_creative(params={
        "name": name,
        "object_story_spec": {
            "page_id": account.get("page_id", ""),
            "link_data": {
                "image_hash": image_hash,
                "link": "https://www.instagram.com/",
            },
        },
    })
    creative_id = creative["id"]

    _log_action("upload_creative", {
        "creative_id": creative_id, "image_hash": image_hash, "name": name,
    }, log_dir=log_dir)
    return creative_id


def toggle_status(
    object_id: str,
    object_type: str,
    status: str,
    log_dir: Path | None = None,
) -> None:
    """캠페인/광고세트/광고 상태 변경 (ACTIVE/PAUSED)."""
    type_map = {"campaign": Campaign, "adset": AdSet, "ad": Ad}
    cls = type_map.get(object_type)
    if not cls:
        raise ValueError(f"지원하지 않는 object_type: {object_type}")

    obj = cls(object_id)
    obj.api_update(params={"status": status})

    _log_action("toggle_status", {
        "object_id": object_id, "object_type": object_type, "status": status,
    }, log_dir=log_dir)
    logger.info(f"{object_type} {object_id} → {status}")


def update_budget(
    adset_id: str,
    new_daily_budget: int,
    account_key: str = "",
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> None:
    """광고세트 일예산 변경."""
    if account_key:
        _check_budget_limit(account_key, new_daily_budget, config_path=config_path)

    adset = AdSet(adset_id)
    adset.api_update(params={"daily_budget": new_daily_budget * 100})

    _log_action("update_budget", {
        "adset_id": adset_id, "new_daily_budget": new_daily_budget,
    }, log_dir=log_dir)


def list_campaigns(
    account_key: str,
    status_filter: str | None = None,
    config_path: Path | None = None,
) -> list[dict]:
    """계정의 캠페인 목록 조회."""
    account = get_account(account_key, config_path)
    fields = ["id", "name", "status", "daily_budget", "objective"]
    params = {}
    if status_filter:
        params["filtering"] = [{"field": "status", "operator": "EQUAL", "value": status_filter}]

    campaigns = account.get_campaigns(fields=fields, params=params)
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "status": c["status"],
            "daily_budget": int(c.get("daily_budget", 0)) // 100,
            "objective": c.get("objective", ""),
        }
        for c in campaigns
    ]


def get_campaign_structure(
    campaign_id: str,
    config_path: Path | None = None,
) -> dict:
    """캠페인 → 광고세트 → 광고 전체 구조 조회."""
    campaign = Campaign(campaign_id)
    campaign_data = campaign.api_get(fields=["id", "name", "status", "objective"])

    adsets = campaign.get_ad_sets(fields=["id", "name", "status", "daily_budget", "targeting"])
    adsets_data = []
    for adset in adsets:
        ads = AdSet(adset["id"]).get_ads(fields=["id", "name", "status", "creative"])
        adsets_data.append({
            "id": adset["id"],
            "name": adset["name"],
            "status": adset["status"],
            "daily_budget": int(adset.get("daily_budget", 0)) // 100,
            "ads": [{"id": ad["id"], "name": ad["name"], "status": ad["status"]} for ad in ads],
        })

    return {
        "campaign": {
            "id": campaign_data["id"],
            "name": campaign_data["name"],
            "status": campaign_data["status"],
        },
        "adsets": adsets_data,
    }
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/test_campaign_manager.py -v
```

Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/meta/campaign_manager.py tests/meta/test_campaign_manager.py
git commit -m "feat: campaign_manager — 캠페인 CRUD, 안전장치, 소재 업로드"
```

---

### Task 7: 전체 테스트 실행 + Cron 설정

- [ ] **Step 1: 전체 테스트 실행**

```bash
scripts/meta/.venv/bin/python -m pytest tests/meta/ -v
```

Expected: All tests PASS

- [ ] **Step 2: Cron 등록**

```bash
(crontab -l 2>/dev/null; echo "0 9 * * * cd /Users/wooseongmin/AI/.worktrees/meta-ads && scripts/meta/.venv/bin/python scripts/meta/daily_reporter.py >> logs/daily_report.log 2>&1") | crontab -
```

- [ ] **Step 3: Cron 등록 확인**

```bash
crontab -l | grep daily_reporter
```

Expected: `0 9 * * * cd /Users/wooseongmin/AI/.worktrees/meta-ads && scripts/meta/.venv/bin/python scripts/meta/daily_reporter.py >> logs/daily_report.log 2>&1`

- [ ] **Step 4: 최종 Commit**

```bash
git add -A
git commit -m "feat: Meta 퍼포먼스 광고 자동화 v1 완성 — 전체 테스트 통과"
```

---

## Post-Implementation: API 셋업 체크리스트

구현이 완료되면 아래 순서로 실제 Meta API를 연결한다:

- [ ] developers.facebook.com에서 앱 생성 (비즈니스 유형)
- [ ] 비즈니스 관리자에서 시스템 사용자 생성 (관리자 역할)
- [ ] 시스템 사용자 토큰 발급 (ads_management, ads_read, business_management, read_insights)
- [ ] 시스템 사용자에 광고 계정 4개 자산 할당
- [ ] `config.yaml.example`을 복사하여 `config.yaml` 생성, 실제 계정 ID 입력
- [ ] 환경변수 등록: `META_ACCESS_TOKEN`, `SLACK_WEBHOOK_URL`
- [ ] `python scripts/meta/daily_reporter.py --account brandrise` 로 수동 테스트
- [ ] Slack에 보고서가 정상 도착하는지 확인
