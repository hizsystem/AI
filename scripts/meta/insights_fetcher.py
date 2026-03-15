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
