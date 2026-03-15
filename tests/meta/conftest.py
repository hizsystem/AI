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
