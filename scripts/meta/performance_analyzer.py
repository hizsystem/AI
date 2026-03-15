"""성과 비교 및 이상 징후 감지."""
from __future__ import annotations

from datetime import datetime, timedelta
from pathlib import Path

from meta.auth import load_config
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
