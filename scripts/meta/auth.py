"""Meta Marketing API 인증 및 계정 관리."""
from __future__ import annotations

import os
from pathlib import Path

import requests
import yaml

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
