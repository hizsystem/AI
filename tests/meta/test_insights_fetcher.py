import pytest
import json
from unittest.mock import patch, MagicMock
from pathlib import Path
from datetime import date

from meta.insights_fetcher import (
    fetch_daily, save_insights, load_insights, fetch_range,
    METRICS_FIELDS,
)


class _FakeRow(dict):
    """Meta API 응답 행을 흉내내는 dict 서브클래스."""
    pass


class TestFetchDaily:
    @patch("meta.insights_fetcher.get_account")
    def test_returns_metrics_dict(self, mock_get_account, sample_config, monkeypatch):
        monkeypatch.setenv("META_ACCESS_TOKEN", "test_token")
        mock_account = MagicMock()
        row = _FakeRow({
            "spend": "19200", "impressions": "3412", "clicks": "68",
            "ctr": "1.99", "cpc": "282.35", "cpm": "5628.0",
            "actions": [{"action_type": "offsite_conversion", "value": "3"}],
            "cost_per_action_type": [{"action_type": "offsite_conversion", "value": "6400"}],
            "action_values": [{"action_type": "offsite_conversion", "value": "0"}],
        })
        mock_account.get_insights.return_value = [row]
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
