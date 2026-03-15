import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

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
    @patch("meta.daily_reporter.time.sleep")
    @patch("meta.daily_reporter._cleanup_old_data")
    @patch("meta.daily_reporter.send_to_slack")
    @patch("meta.daily_reporter.detect_anomalies")
    @patch("meta.daily_reporter.compare_daily")
    @patch("meta.daily_reporter.fetch_daily")
    @patch("meta.daily_reporter.validate_token")
    def test_orchestrates_all_accounts(self, mock_validate, mock_fetch, mock_compare,
                                        mock_anomalies, mock_slack, mock_cleanup, mock_sleep, sample_config):
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

    @patch("meta.daily_reporter.time.sleep")
    @patch("meta.daily_reporter._cleanup_old_data")
    @patch("meta.daily_reporter.send_to_slack")
    @patch("meta.daily_reporter.validate_token")
    def test_invalid_token_sends_error(self, mock_validate, mock_slack, mock_cleanup, mock_sleep, sample_config):
        mock_validate.return_value = False
        mock_slack.return_value = True
        report = run_daily_report(date_str="2026-03-14", config_path=sample_config)
        assert "토큰" in report
        mock_slack.assert_called_once()

    @patch("meta.daily_reporter.time.sleep")
    @patch("meta.daily_reporter._cleanup_old_data")
    @patch("meta.daily_reporter.send_to_slack")
    @patch("meta.daily_reporter.detect_anomalies")
    @patch("meta.daily_reporter.compare_daily")
    @patch("meta.daily_reporter.fetch_daily")
    @patch("meta.daily_reporter.validate_token")
    def test_single_account_failure_continues(self, mock_validate, mock_fetch, mock_compare,
                                               mock_anomalies, mock_slack, mock_cleanup, mock_sleep, sample_config):
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
