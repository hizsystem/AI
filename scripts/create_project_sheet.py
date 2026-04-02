#!/usr/bin/env python3
"""프로젝트 마스터시트 자동 생성 스크립트 (API 호출 최소화 버전)"""

import argparse
import time
import sys
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client, MONTHS


def create_summary_tab(ws, name, team):
    """탭 1: 종합-요약-색인"""
    ws.update_title("종합-요약-색인")
    data = [
        ["[프로젝트 개요]", ""],
        ["프로젝트명", name],
        ["클라이언트", ""],
        ["담당팀", team],
        ["계약기간", ""],
        ["계약금액", ""],
        ["", ""],
        ["[핵심 수치 요약]", ""],
        ["총 예상매출", "='2026 예상 매출'!Q2"],
        ["총 예산(지출)", "='2026 예상 지출'!N2"],
        ["현재 실매출", 0],
        ["현재 실지출", 0],
        ["수익률", "=IF(B9=0,0,(B9-B10)/B9)"],
        ["", ""],
        ["[시트 색인]", ""],
        ["종합-요약-색인", "이 탭"],
        ["2026 예상 매출", "세금계산서 기준 월별 매출"],
        ["2026 예상 지출", "카테고리별 월별 지출"],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1", "format": {"textFormat": {"bold": True, "fontSize": 11}}},
        {"range": "A8", "format": {"textFormat": {"bold": True, "fontSize": 11}}},
        {"range": "A15", "format": {"textFormat": {"bold": True, "fontSize": 11}}},
    ])


def create_revenue_tab(sh):
    """탭 2: 2026 예상 매출"""
    ws = sh.add_worksheet(title="2026 예상 매출", rows=50, cols=17)
    header = ["항목", "세금계산서 발행일", "공급가", "VAT포함"] + MONTHS + ["연간합계"]

    # 합계 행 (행 2)
    sum_row = ["[월별 합계]", ""]
    sum_row.append("=SUM(C3:C50)")  # 공급가 합계
    sum_row.append("=SUM(D3:D50)")  # VAT포함 합계
    for c in range(ord("E"), ord("Q")):  # E~P (1월~12월)
        sum_row.append(f"=SUM({chr(c)}3:{chr(c)}50)")
    sum_row.append("=SUM(E2:P2)")  # 연간합계

    ws.update(values=[header, sum_row], range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1:Q1", "format": {
            "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.15, "green": 0.5, "blue": 0.3},
        }},
        {"range": "A2:Q2", "format": {"textFormat": {"bold": True}}},
    ])
    return ws


def create_expense_tab(sh):
    """탭 3: 2026 예상 지출 — 카테고리 1행씩 플랫 구조"""
    ws = sh.add_worksheet(title="2026 예상 지출", rows=15, cols=14)

    categories = ["외주비", "광고비", "진행비", "매체비", "이벤트"]
    all_data = []

    # 행 1: 헤더
    all_data.append(["카테고리"] + MONTHS + ["연간합계"])

    # 행 2: 월별 총합계
    sum_row = ["[월별 총합계]"]
    for c_idx in range(12):
        col = chr(ord("B") + c_idx)
        sum_row.append(f"=SUM({col}3:{col}{2 + len(categories)})")
    sum_row.append("=SUM(B2:M2)")
    all_data.append(sum_row)

    # 행 3~: 카테고리 (각 1행)
    for cat in categories:
        row_num = len(all_data) + 1
        all_data.append([cat] + [0] * 12 + [f"=SUM(B{row_num}:M{row_num})"])

    # 빈 행 (추가용)
    all_data.append([""])
    all_data.append([""])

    ws.update(values=all_data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1:N1", "format": {
            "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.7, "green": 0.2, "blue": 0.2},
        }},
        {"range": "A2:N2", "format": {"textFormat": {"bold": True}}},
    ])
    return ws


def create_project_sheet(name, team, share_emails=None):
    client = get_client()
    title = f"[2026] {name} 마스터시트"

    sh = client.create(title)
    print(f"Created: {title}")
    print(f"URL: {sh.url}")

    # 탭 1: 종합-요약-색인
    create_summary_tab(sh.sheet1, name, team)
    time.sleep(3)

    # 탭 2: 2026 예상 매출
    create_revenue_tab(sh)
    time.sleep(3)

    # 탭 3: 2026 예상 지출
    create_expense_tab(sh)

    # 공유
    if share_emails:
        for email in share_emails:
            sh.share(email.strip(), perm_type="user", role="writer")
            print(f"Shared with: {email.strip()}")

    return sh


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="프로젝트 마스터시트 생성")
    parser.add_argument("--name", required=True, help="프로젝트명")
    parser.add_argument("--team", required=True, help="담당 팀명")
    parser.add_argument("--share", help="공유 이메일 (쉼표 구분)")
    args = parser.parse_args()

    emails = args.share.split(",") if args.share else None
    create_project_sheet(args.name, args.team, emails)
