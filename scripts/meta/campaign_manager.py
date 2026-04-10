"""캠페인/광고세트/광고 CRUD + 안전장치."""
from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from pathlib import Path

import requests

from meta.auth import load_config, get_account

try:
    from facebook_business.adobjects.campaign import Campaign
    from facebook_business.adobjects.adset import AdSet
    from facebook_business.adobjects.ad import Ad
    from facebook_business.adobjects.adcreative import AdCreative
    from facebook_business.adobjects.adimage import AdImage
except ImportError:
    Campaign = AdSet = Ad = AdCreative = AdImage = None

logger = logging.getLogger(__name__)

CONFIG_DIR = Path(__file__).parent
DEFAULT_LOG_DIR = Path(__file__).parent.parent.parent / "logs" / "actions"


def _check_budget_limit(
    account_key: str,
    daily_budget: int,
    config_path: Path | None = None,
) -> None:
    """config의 일예산 상한 초과 시 에러."""
    config = load_config(config_path)
    limit = config["accounts"][account_key].get("daily_budget_alert", float("inf"))
    if daily_budget > limit:
        raise ValueError(
            f"예산 상한 초과: ₩{daily_budget:,} > ₩{limit:,} (계정: {account_key})"
        )


def _log_action(
    action: str,
    data: dict,
    log_dir: Path | None = None,
) -> None:
    """모든 생성/변경을 JSON 로그로 저장."""
    base = log_dir or DEFAULT_LOG_DIR
    base.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = base / f"{timestamp}_{action}.json"
    log_file.write_text(
        json.dumps({"action": action, "timestamp": timestamp, **data},
                    ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def create_campaign(
    account_key: str,
    name: str,
    objective: str,
    daily_budget: int = 20000,
    bid_strategy: str = "LOWEST_COST_WITHOUT_CAP",
    schedule: dict | None = None,
    dry_run: bool = False,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """캠페인 생성. 항상 PAUSED 상태로 생성.

    Args:
        daily_budget: 원 단위 일예산 (예: 7143 → ₩7,143/일)
    """
    _check_budget_limit(account_key, daily_budget, config_path=config_path)

    params = {
        "name": name,
        "objective": objective,
        "status": "PAUSED",
        "special_ad_categories": [],
        "daily_budget": daily_budget,  # 원 단위 그대로 전달 (Meta KRW 계정은 센트 변환 불필요)
        "bid_strategy": bid_strategy,
    }
    if schedule:
        params.update(schedule)

    if dry_run:
        logger.info(f"[DRY RUN] create_campaign: {params}")
        _log_action("create_campaign_dry", params, log_dir=log_dir)
        return "dry_run_campaign_id"

    account = get_account(account_key, config_path)
    campaign = account.create_campaign(params=params)
    campaign_id = campaign["id"]

    _log_action("create_campaign", {"campaign_id": campaign_id, **params}, log_dir=log_dir)
    logger.info(f"캠페인 생성: {campaign_id} ({name})")
    return campaign_id


def create_adset(
    campaign_id: str,
    name: str,
    targeting: dict,
    placements: dict | None = None,
    daily_budget: int | None = None,
    optimization_goal: str = "LINK_CLICKS",
    advantage_audience: bool = False,
    account_key: str = "",
    dry_run: bool = False,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """광고세트 생성.

    Args:
        daily_budget: 원 단위. None이면 캠페인 예산(CBO) 사용.
        advantage_audience: True면 Meta Advantage 타겟 확장 활성화.
    """
    # Advantage 타겟 플래그 (Meta API v25+ 필수)
    targeting["targeting_automation"] = {
        "advantage_audience": 1 if advantage_audience else 0,
    }

    params = {
        "campaign_id": campaign_id,
        "name": name,
        "targeting": targeting,
        "billing_event": "IMPRESSIONS",
        "optimization_goal": optimization_goal,
        "status": "PAUSED",
    }
    if daily_budget is not None:
        params["daily_budget"] = daily_budget  # 원 단위 그대로

    if placements:
        params["targeting"]["publisher_platforms"] = placements.get("platforms", ["instagram"])

    if dry_run:
        logger.info(f"[DRY RUN] create_adset: {params}")
        _log_action("create_adset_dry", params, log_dir=log_dir)
        return "dry_run_adset_id"

    account = get_account(account_key, config_path)
    adset = account.create_ad_set(params=params)
    adset_id = adset["id"]

    _log_action("create_adset", {"adset_id": adset_id, **params}, log_dir=log_dir)
    return adset_id


def create_ad(
    adset_id: str,
    name: str,
    creative_id: str,
    status: str = "PAUSED",
    account_key: str = "",
    dry_run: bool = False,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """광고 생성. 기본 PAUSED."""
    params = {
        "adset_id": adset_id,
        "name": name,
        "creative": {"creative_id": creative_id},
        "status": status,
    }

    if dry_run:
        logger.info(f"[DRY RUN] create_ad: {params}")
        _log_action("create_ad_dry", params, log_dir=log_dir)
        return "dry_run_ad_id"

    account = get_account(account_key, config_path)
    ad = account.create_ad(params=params)
    ad_id = ad["id"]

    _log_action("create_ad", {"ad_id": ad_id, **params}, log_dir=log_dir)
    return ad_id


def upload_image(
    account_key: str,
    image_path: str,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """이미지 업로드 → image_hash 반환. REST API 사용."""
    config = load_config(config_path)
    account_id = config["accounts"][account_key]["ad_account_id"]
    token = os.environ.get("META_ACCESS_TOKEN", "")
    base = "https://graph.facebook.com/v25.0"

    with open(image_path, "rb") as f:
        resp = requests.post(
            f"{base}/{account_id}/adimages",
            files={"filename": f},
            data={"access_token": token},
            timeout=60,
        )
    data = resp.json()
    image_hash = list(data.get("images", {}).values())[0]["hash"]

    _log_action("upload_image", {"image_hash": image_hash, "path": image_path}, log_dir=log_dir)
    logger.info(f"이미지 업로드: {image_hash} ({image_path})")
    return image_hash


def create_creative(
    account_key: str,
    name: str,
    image_hash: str,
    page_id: str,
    link: str,
    primary_text: str,
    headline: str,
    description: str = "",
    call_to_action: str = "APPLY_NOW",
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """AdCreative 생성. REST API 사용 (페이지 권한 이슈 우회)."""
    config = load_config(config_path)
    account_id = config["accounts"][account_key]["ad_account_id"]
    token = os.environ.get("META_ACCESS_TOKEN", "")
    base = "https://graph.facebook.com/v25.0"

    resp = requests.post(
        f"{base}/{account_id}/adcreatives",
        json={
            "name": name,
            "object_story_spec": {
                "page_id": page_id,
                "link_data": {
                    "image_hash": image_hash,
                    "link": link,
                    "message": primary_text,
                    "name": headline,
                    "description": description,
                    "call_to_action": {
                        "type": call_to_action,
                        "value": {"link": link},
                    },
                },
            },
            "access_token": token,
        },
        timeout=30,
    )
    data = resp.json()
    creative_id = data.get("id")
    if not creative_id:
        error_msg = data.get("error", {}).get("error_user_msg", str(data))
        raise ValueError(f"크리에이티브 생성 실패: {error_msg}")

    _log_action("create_creative", {
        "creative_id": creative_id, "name": name, "image_hash": image_hash,
    }, log_dir=log_dir)
    logger.info(f"크리에이티브 생성: {creative_id} ({name})")
    return creative_id


def upload_creative(
    account_key: str,
    image_path: str,
    name: str,
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> str:
    """[레거시] 이미지 업로드 -> AdCreative 생성 -> creative_id 반환."""
    account = get_account(account_key, config_path)

    image = AdImage(parent_id=account["id"])
    image[AdImage.Field.filename] = image_path
    image.remote_create()
    image_hash = image[AdImage.Field.hash]

    creative = account.create_ad_creative(params={
        "name": name,
        "object_story_spec": {
            "page_id": account.get("page_id", ""),
            "link_data": {
                "image_hash": image_hash,
                "link": "https://www.instagram.com/",
            },
        },
    })
    creative_id = creative["id"]

    _log_action("upload_creative", {
        "creative_id": creative_id, "image_hash": image_hash, "name": name,
    }, log_dir=log_dir)
    return creative_id


def toggle_status(
    object_id: str,
    object_type: str,
    status: str,
    log_dir: Path | None = None,
) -> None:
    """캠페인/광고세트/광고 상태 변경 (ACTIVE/PAUSED)."""
    type_map = {"campaign": Campaign, "adset": AdSet, "ad": Ad}
    cls = type_map.get(object_type)
    if not cls:
        raise ValueError(f"지원하지 않는 object_type: {object_type}")

    obj = cls(object_id)
    obj.api_update(params={"status": status})

    _log_action("toggle_status", {
        "object_id": object_id, "object_type": object_type, "status": status,
    }, log_dir=log_dir)
    logger.info(f"{object_type} {object_id} → {status}")


def update_budget(
    adset_id: str,
    new_daily_budget: int,
    account_key: str = "",
    config_path: Path | None = None,
    log_dir: Path | None = None,
) -> None:
    """광고세트 일예산 변경."""
    if account_key:
        _check_budget_limit(account_key, new_daily_budget, config_path=config_path)

    adset = AdSet(adset_id)
    adset.api_update(params={"daily_budget": new_daily_budget})  # 원 단위 그대로

    _log_action("update_budget", {
        "adset_id": adset_id, "new_daily_budget": new_daily_budget,
    }, log_dir=log_dir)


def list_campaigns(
    account_key: str,
    status_filter: str | None = None,
    config_path: Path | None = None,
) -> list[dict]:
    """계정의 캠페인 목록 조회."""
    account = get_account(account_key, config_path)
    fields = ["id", "name", "status", "daily_budget", "objective"]
    params = {}
    if status_filter:
        params["filtering"] = [{"field": "status", "operator": "EQUAL", "value": status_filter}]

    campaigns = account.get_campaigns(fields=fields, params=params)
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "status": c["status"],
            "daily_budget": int(c.get("daily_budget", 0)) // 100,
            "objective": c.get("objective", ""),
        }
        for c in campaigns
    ]


def get_campaign_structure(
    campaign_id: str,
    config_path: Path | None = None,
) -> dict:
    """캠페인 -> 광고세트 -> 광고 전체 구조 조회."""
    campaign = Campaign(campaign_id)
    campaign_data = campaign.api_get(fields=["id", "name", "status", "objective"])

    adsets = campaign.get_ad_sets(fields=["id", "name", "status", "daily_budget", "targeting"])
    adsets_data = []
    for adset in adsets:
        ads = AdSet(adset["id"]).get_ads(fields=["id", "name", "status", "creative"])
        adsets_data.append({
            "id": adset["id"],
            "name": adset["name"],
            "status": adset["status"],
            "daily_budget": int(adset.get("daily_budget", 0)) // 100,
            "ads": [{"id": ad["id"], "name": ad["name"], "status": ad["status"]} for ad in ads],
        })

    return {
        "campaign": {
            "id": campaign_data["id"],
            "name": campaign_data["name"],
            "status": campaign_data["status"],
        },
        "adsets": adsets_data,
    }
