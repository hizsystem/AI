import pytest
from pathlib import Path

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
    def test_ctr_drop_alert(self, data_dir, sample_config):
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
                                   thresholds=thresholds, data_dir=data_dir,
                                   config_path=sample_config)
        assert any("CTR" in a["message"] for a in alerts)

    def test_no_ctr_cpa_anomaly(self, sample_daily_insights, sample_yesterday_insights, data_dir, sample_config):
        """CTR/CPA 이상 없음 (budget_under는 샘플 데이터 특성상 발생 가능)."""
        save_insights("brandrise", sample_yesterday_insights, "2026-03-13", data_dir=data_dir)
        save_insights("brandrise", sample_daily_insights, "2026-03-14", data_dir=data_dir)

        thresholds = {"ctr_drop": 30, "cpa_spike": 50, "budget_under": 80}
        alerts = detect_anomalies("brandrise", "2026-03-14",
                                   thresholds=thresholds, data_dir=data_dir,
                                   config_path=sample_config)
        # CTR/CPA 이상은 없어야 함
        assert not any(a["type"] in ("ctr_drop", "cpa_spike") for a in alerts)

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
