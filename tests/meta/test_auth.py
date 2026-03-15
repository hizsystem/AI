import pytest
from unittest.mock import patch, MagicMock

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
