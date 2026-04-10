"""데일리 보고 생성 + Slack Webhook 발송. Cron 진입점."""
from __future__ import annotations

import argparse
import json
import logging
import os
import time
from datetime import datetime, timedelta
from pathlib import Path

import requests

from meta.auth import load_config, validate_token
from meta.insights_fetcher import fetch_daily, fetch_by_ad, save_insights, load_insights
from meta.performance_analyzer import compare_daily, detect_anomalies

logger = logging.getLogger(__name__)

CONFIG_DIR = Path(__file__).parent


def format_account_block(
    account_name: str,
    insights: dict,
    comparison: dict,
    anomalies: list[dict],
) -> str:
    """계정별 보고 블록 포맷팅."""
    metrics = comparison.get("metrics", {})

    def _fmt_change(key: str) -> str:
        change = metrics.get(key, {}).get("change", 0)
        if change == 0:
            return ""
        sign = "+" if change > 0 else ""
        return f" ({sign}{change}%)"

    roas = insights.get("roas", 0)
    roas_str = f"ROAS {roas}x{_fmt_change('roas')}"

    lines = [
        f"[{account_name}]",
        f"지출 ₩{insights.get('spend', 0):,}{_fmt_change('spend')}  |  "
        f"노출 {insights.get('impressions', 0):,}  |  "
        f"클릭 {insights.get('clicks', 0):,}",
        f"CTR {insights.get('ctr', 0)}%{_fmt_change('ctr')}  |  "
        f"CPC ₩{insights.get('cpc', 0):,}{_fmt_change('cpc')}  |  "
        f"{roas_str}",
        f"전환 {insights.get('conversions', 0)}건  |  "
        f"CPA ₩{insights.get('cpa', 0):,}{_fmt_change('cpa')}",
    ]

    for alert in anomalies:
        lines.append(f">> 주의: {alert['message']}")

    # Pixel 퍼널 데이터
    funnel = insights.get("funnel", {})
    pv = funnel.get("page_view", 0)
    ic = funnel.get("initiate_checkout", 0)
    cr = funnel.get("complete_registration", 0)
    lead = funnel.get("lead", 0)
    clicks = insights.get("clicks", 0)

    if pv > 0 or ic > 0 or cr > 0 or lead > 0:
        lines.append("")
        lines.append("🔄 진단 퍼널")

        # 전환율 계산
        click_to_land = f" ({round(pv / clicks * 100)}%)" if clicks > 0 else ""
        land_to_start = f" ({round(ic / pv * 100)}%)" if pv > 0 else ""
        start_to_done = f" ({round(cr / ic * 100)}%)" if ic > 0 else ""
        done_to_lead = f" ({round(lead / cr * 100)}%)" if cr > 0 else ""

        lines.append(
            f"  클릭 {clicks} → 랜딩 {pv}{click_to_land} → "
            f"진단시작 {ic}{land_to_start} → "
            f"진단완료 {cr}{start_to_done} → "
            f"상담신청 {lead}{done_to_lead}"
        )

    return "\n".join(lines)


def format_ad_breakdown(
    account_key: str,
    date_str: str,
    config_path: Path | None = None,
) -> str:
    """소재별 성과 상세 블록."""
    try:
        ads = fetch_by_ad(
            adset_id="",  # 빈 값이면 계정 전체 ad-level 조회
            date_str=date_str,
            account_key=account_key,
            config_path=config_path,
        )
    except Exception as e:
        logger.warning(f"소재별 조회 실패: {e}")
        return ""

    if not ads:
        return ""

    # 지출 기준 내림차순 정렬
    ads.sort(key=lambda x: x.get("spend", 0), reverse=True)

    lines = ["\n📊 소재별 상세"]
    for ad in ads:
        name = ad.get("ad_name", "?")
        spend = ad.get("spend", 0)
        impressions = ad.get("impressions", 0)
        clicks = ad.get("clicks", 0)
        ctr = ad.get("ctr", 0)
        cpc = ad.get("cpc", 0)

        if spend == 0 and impressions == 0:
            continue

        lines.append(
            f"  {name}\n"
            f"    지출 ₩{spend:,} | 노출 {impressions:,} | 클릭 {clicks} | "
            f"CTR {ctr}% | CPC ₩{cpc:,}"
        )

    # 최고/최저 CTR 하이라이트
    active_ads = [a for a in ads if a.get("impressions", 0) > 0]
    if len(active_ads) >= 2:
        best = max(active_ads, key=lambda x: x.get("ctr", 0))
        worst = min(active_ads, key=lambda x: x.get("ctr", 0))
        lines.append(
            f"\n  🏆 최고 CTR: {best.get('ad_name', '?')} ({best.get('ctr', 0)}%)"
            f"\n  ⚠️ 최저 CTR: {worst.get('ad_name', '?')} ({worst.get('ctr', 0)}%)"
        )

    return "\n".join(lines)


def format_summary(all_accounts_data: list[dict]) -> str:
    """전체 요약 블록."""
    total_spend = sum(a["insights"].get("spend", 0) for a in all_accounts_data)
    total_conversions = sum(a["insights"].get("conversions", 0) for a in all_accounts_data)
    total_roas_num = sum(a["insights"].get("spend", 0) * a["insights"].get("roas", 0)
                         for a in all_accounts_data)
    avg_roas = round(total_roas_num / total_spend, 1) if total_spend > 0 else 0.0

    num_accounts = len(all_accounts_data)
    num_warning = sum(1 for a in all_accounts_data if a["anomalies"])
    num_ok = num_accounts - num_warning

    return (
        f"───────────────────────────\n"
        f"전체: 계정 {num_accounts}개 | "
        f"지출 ₩{total_spend:,} | "
        f"전환 {total_conversions}건 | "
        f"ROAS {avg_roas}x\n"
        f"정상 {num_ok} | 주의 {num_warning} | 긴급 0"
    )


def send_to_slack(message: str) -> bool:
    """Slack Webhook으로 메시지 발송."""
    webhook_url = os.environ.get("SLACK_WEBHOOK_URL")
    if not webhook_url:
        logger.error("SLACK_WEBHOOK_URL 환경변수 없음")
        return False

    try:
        resp = requests.post(
            webhook_url,
            json={"text": message},
            timeout=10,
        )
        return resp.status_code == 200
    except requests.RequestException as e:
        logger.error(f"Slack 발송 실패: {e}")
        return False


def run_daily_report(
    date_str: str | None = None,
    account_filter: str | None = None,
    config_path: Path | None = None,
) -> str:
    """메인 실행. 전체 계정 순회 → 보고서 생성 → Slack 발송."""
    if not date_str:
        date_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    config = load_config(config_path or CONFIG_DIR / "config.yaml")
    thresholds = config.get("report", {}).get("alert_thresholds", {})

    # 토큰 검증
    if not validate_token():
        error_msg = f"[Meta 광고 오류] 토큰 유효성 검사 실패 — {date_str}"
        send_to_slack(error_msg)
        return error_msg

    weekday = ["월", "화", "수", "목", "금", "토", "일"]
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    date_kr = f"{dt.year}년 {dt.month}월 {dt.day}일 ({weekday[dt.weekday()]})"
    header = f"Meta 광고 데일리 — {date_kr}\n"

    all_accounts_data = []
    accounts = config["accounts"]
    if account_filter:
        accounts = {k: v for k, v in accounts.items() if k == account_filter}

    for account_key, account_info in accounts.items():
        for attempt in range(3):  # rate limit 재시도 최대 3회
            try:
                insights = fetch_daily(account_key, date_str, config_path=config_path)
                comparison = compare_daily(account_key, date_str)
                anomalies = detect_anomalies(account_key, date_str, thresholds=thresholds,
                                             config_path=config_path or CONFIG_DIR / "config.yaml")

                block = format_account_block(account_info["name"], insights, comparison, anomalies)
                ad_detail = format_ad_breakdown(
                    account_key, date_str,
                    config_path=config_path or CONFIG_DIR / "config.yaml",
                )
                all_accounts_data.append({
                    "name": account_info["name"],
                    "insights": insights,
                    "anomalies": anomalies,
                    "block": block + ad_detail,
                })
                break  # 성공 시 재시도 루프 탈출
            except Exception as e:
                if "rate limit" in str(e).lower() and attempt < 2:
                    logger.warning(f"계정 {account_key} rate limit, {attempt+1}/3 재시도...")
                    time.sleep(5)
                    continue
                logger.error(f"계정 {account_key} 처리 실패: {e}")
                all_accounts_data.append({
                    "name": account_info["name"],
                    "insights": {"spend": 0, "conversions": 0, "roas": 0},
                    "anomalies": [],
                    "block": f"[{account_info['name']}]\n>> 오류: {e}",
                })
                break
        time.sleep(2)  # 계정 간 rate limit 방지

    # 90일 초과 데이터 정리
    _cleanup_old_data(config)

    body = "\n\n".join(a["block"] for a in all_accounts_data)
    summary = format_summary(all_accounts_data)
    full_message = f"{header}\n{body}\n\n{summary}"

    send_to_slack(full_message)
    return full_message


def _cleanup_old_data(config: dict, retention_days: int = 90) -> None:
    """90일 초과 일별 JSON 파일 삭제."""
    from meta.insights_fetcher import DEFAULT_DATA_DIR
    cutoff = datetime.now() - timedelta(days=retention_days)
    for account_key in config.get("accounts", {}):
        account_dir = DEFAULT_DATA_DIR / account_key
        if not account_dir.exists():
            continue
        for f in account_dir.glob("????-??-??.json"):
            try:
                file_date = datetime.strptime(f.stem, "%Y-%m-%d")
                if file_date < cutoff:
                    f.unlink()
                    logger.info(f"삭제: {f}")
            except ValueError:
                continue


def main():
    parser = argparse.ArgumentParser(description="Meta 광고 데일리 리포트")
    parser.add_argument("--date", help="보고 날짜 (YYYY-MM-DD, 기본: 어제)")
    parser.add_argument("--account", help="특정 계정만 보고")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    try:
        report = run_daily_report(date_str=args.date, account_filter=args.account)
        print(report)
    except Exception as e:
        error_msg = f"[Meta 광고 오류] 데일리 리포트 실패: {e}"
        logger.error(error_msg)
        send_to_slack(error_msg)
        raise


if __name__ == "__main__":
    main()
