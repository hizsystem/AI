#!/usr/bin/env python3
"""NP 매장 공유용 시트 생성 스크립트

사장님과 공유하는 네이버플레이스 코칭 시트를 생성한다.
탭: 코칭 현황 / 주간 미션 / 성과 추적

Usage:
    python3 scripts/create_np_client_sheet.py --name "미례국밥" --owner "김미례"
    python3 scripts/create_np_client_sheet.py --name "명동식당" --owner "박사장" --share "owner@email.com"
"""

import argparse
import time
import sys
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client, MONTHS


def create_dashboard_tab(ws, store_name, owner):
    """탭 1: 코칭 현황"""
    ws.update_title("코칭 현황")
    data = [
        ["[매장 정보]", ""],
        ["매장명", store_name],
        ["대표", owner],
        ["코칭 시작일", ""],
        ["현재 등급", ""],
        ["목표 등급", ""],
        ["", ""],
        ["[이번 주 핵심]", ""],
        ["주차", ""],
        ["미션 완료율", "='주간 미션'!F2"],
        ["이번 주 미션", ""],
        ["", ""],
        ["[핵심 지표 현황]", "", "", ""],
        ["지표", "현재", "목표", "변동"],
        ["N1 (유사도)", "", "", ""],
        ["N2 (관련성)", "", "", ""],
        ["N3 (랭킹)", "", "", ""],
        ["리뷰 수", "", "", ""],
        ["별점 평균", "", "", ""],
        ["주요 키워드 순위", "", "", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1", "format": {"textFormat": {"bold": True, "fontSize": 11}}},
        {"range": "A8", "format": {"textFormat": {"bold": True, "fontSize": 11}}},
        {"range": "A13", "format": {"textFormat": {"bold": True, "fontSize": 11}}},
        {"range": "A14:D14", "format": {
            "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.15, "green": 0.5, "blue": 0.3},
        }},
    ])


def create_weekly_mission_tab(sh):
    """탭 2: 주간 미션"""
    ws = sh.add_worksheet(title="주간 미션", rows=100, cols=7)
    header = ["주차", "미션", "우선순위", "카테고리", "완료", "완료일", "비고"]
    summary = [
        "완료율",
        '=IFERROR(COUNTIF(E3:E100,"완료")/COUNTA(B3:B100),0)',
        "", "", "", "", "",
    ]
    ws.update(values=[header, summary], range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1:G1", "format": {
            "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.2, "green": 0.4, "blue": 0.7},
        }},
        {"range": "A2:G2", "format": {"textFormat": {"bold": True}}},
    ])

    # 드롭다운 (gspread 6.x)
    from gspread.utils import ValidationConditionType

    ws.add_validation("C3:C100", ValidationConditionType.one_of_list,
                      ["S", "A", "B"], showCustomUi=True)
    ws.add_validation("D3:D100", ValidationConditionType.one_of_list,
                      ["세팅", "키워드", "리뷰", "콘텐츠", "광고", "채널연계"],
                      showCustomUi=True)
    ws.add_validation("E3:E100", ValidationConditionType.one_of_list,
                      ["완료", "진행중", "미착수"], showCustomUi=True)
    return ws


def create_performance_tab(sh):
    """탭 3: 성과 추적 (월별)"""
    ws = sh.add_worksheet(title="성과 추적", rows=30, cols=14)
    header = ["지표"] + MONTHS + ["비고"]
    rows = [
        header,
        ["[검색 순위]"],
        ["키워드 1 순위"],
        ["키워드 2 순위"],
        ["키워드 3 순위"],
        [""],
        ["[히든 지수 (에드로그)]"],
        ["N1 (유사도)"],
        ["N2 (관련성)"],
        ["N3 (랭킹)"],
        [""],
        ["[리뷰]"],
        ["월 신규 리뷰"],
        ["누적 리뷰 수"],
        ["별점 평균"],
        [""],
        ["[전환]"],
        ["전화 수"],
        ["길찾기 수"],
        ["예약 수"],
        ["저장 수"],
        [""],
        ["[유입 채널]"],
        ["지도 유입"],
        ["검색 유입"],
        ["블로그 유입"],
        ["외부 유입 (인스타 등)"],
    ]
    ws.update(values=rows, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1:N1", "format": {
            "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.15, "green": 0.5, "blue": 0.3},
        }},
        {"range": "A2", "format": {"textFormat": {"bold": True, "fontSize": 10}}},
        {"range": "A7", "format": {"textFormat": {"bold": True, "fontSize": 10}}},
        {"range": "A12", "format": {"textFormat": {"bold": True, "fontSize": 10}}},
        {"range": "A17", "format": {"textFormat": {"bold": True, "fontSize": 10}}},
        {"range": "A23", "format": {"textFormat": {"bold": True, "fontSize": 10}}},
    ])
    return ws


def create_np_client_sheet(store_name, owner, share_emails=None):
    client = get_client()
    title = f"[NP 코칭] {store_name}"

    sh = client.create(title)
    print(f"Created: {title}")
    print(f"URL: {sh.url}")

    # 탭 1: 코칭 현황
    create_dashboard_tab(sh.sheet1, store_name, owner)
    time.sleep(3)

    # 탭 2: 주간 미션
    create_weekly_mission_tab(sh)
    time.sleep(3)

    # 탭 3: 성과 추적
    create_performance_tab(sh)

    # 공유
    if share_emails:
        for email in share_emails:
            sh.share(email.strip(), perm_type="user", role="writer")
            print(f"Shared with: {email.strip()}")

    return sh


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NP 매장 공유용 시트 생성")
    parser.add_argument("--name", required=True, help="매장명")
    parser.add_argument("--owner", required=True, help="대표 이름")
    parser.add_argument("--share", help="공유 이메일 (쉼표 구분)")
    args = parser.parse_args()

    emails = args.share.split(",") if args.share else None
    create_np_client_sheet(args.name, args.owner, emails)
