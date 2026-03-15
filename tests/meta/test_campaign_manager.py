import pytest
import json
from unittest.mock import patch, MagicMock
from pathlib import Path

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
        assert result[0]["daily_budget"] == 20000  # cents -> 원 변환
