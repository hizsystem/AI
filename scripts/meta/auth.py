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


def validate_token(config_path: Path | None = None) -> dict:
    """토큰 유효성 검사. 성공 시 {'valid': True, 'user': ...}, 실패 시 {'valid': False, 'error': ...}."""
    try:
        token = _get_token()
    except EnvironmentError as e:
        return {"valid": False, "error": str(e)}

    # 1차: /me 엔드포인트 (일반 유저 토큰 + 시스템 유저 토큰 모두 지원)
    resp = requests.get(
        "https://graph.facebook.com/v21.0/me",
        params={"access_token": token},
        timeout=10,
    )
    if resp.status_code == 200:
        data = resp.json()
        return {"valid": True, "user": data.get("name", ""), "user_id": data.get("id", "")}

    # 2차: 광고 계정 직접 접근으로 폴백
    try:
        config = load_config(config_path)
        first_account = next(iter(config["accounts"].values()))
        account_id = first_account["ad_account_id"]
        resp2 = requests.get(
            f"https://graph.facebook.com/v21.0/{account_id}",
            params={"access_token": token, "fields": "name,account_status"},
            timeout=10,
        )
        if resp2.status_code == 200:
            data = resp2.json()
            return {"valid": True, "user": f"account:{data.get('name', '')}", "user_id": account_id}
    except Exception:
        pass

    return {"valid": False, "error": resp.json().get("error", {}).get("message", "Unknown error")}
