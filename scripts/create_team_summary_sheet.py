#!/usr/bin/env python3
"""팀 총괄 마스터시트 자동 생성 스크립트 (API 호출 최소화 버전)"""

import argparse
import time
import sys
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client, MONTHS

TEAMS = ["1팀", "2팀", "3팀"]


def create_dashboard_tab(ws):
    """탭 1: 대시보드"""
    ws.update_title("대시보드")
    data = [
        ["[팀별 프로젝트 현황]"],
        ["팀", "프로젝트 수", "진행중", "완료"],
        ["1팀", "", "", ""],
        ["2팀", "", "", ""],
        ["3팀", "", "", ""],
        [""],
        ["[월별 수익 요약]"],
        [""] + MONTHS + ["연간합계"],
        ["총 매출"] + ["='월별 수익'!C40"] + [""] * 12,
        ["총 지출"] + ["='프로젝트별 월별 총지출'!C20"] + [""] * 12,
        ["수익"] + ["=B9-B10"] + [""] * 12,
        [""],
        ["[연간 누적 수익]"],
        ["누적"] + ["=B11"] + [""] * 11,
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1", "format": {"textFormat": {"bold": True, "fontSize": 12}}},
        {"range": "A7", "format": {"textFormat": {"bold": True, "fontSize": 12}}},
        {"range": "A13", "format": {"textFormat": {"bold": True, "fontSize": 12}}},
        {"range": "A2:D2", "format": {"textFormat": {"bold": True}}},
        {"range": "A8:N8", "format": {"textFormat": {"bold": True}}},
    ])


def create_project_expense_tab(sh):
    """탭 2: 프로젝트별 월별 총지출 — 모든 데이터 한 번에 구성"""
    ws = sh.add_worksheet(title="프로젝트별 월별 총지출", rows=30, cols=15)

    all_data = []
    format_rules = []

    # 행 1: 헤더
    header = ["팀", "프로젝트"] + MONTHS + ["연간합계"]
    all_data.append(header)
    format_rules.append({"range": "A1:O1", "format": {
        "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
        "backgroundColor": {"red": 0.7, "green": 0.2, "blue": 0.2},
    }})

    row = 2
    team_subtotal_rows = []

    for team in TEAMS:
        # 팀 프로젝트 행 (4행)
        for i in range(4):
            if i == 0:
                all_data.append([team, "(프로젝트 추가)"])
            else:
                all_data.append([""])
            row += 1

        # 팀 소계
        start = row - 4
        end = row - 1
        sub = [f"{team} 소계", ""]
        for c in range(ord("C"), ord("P")):
            sub.append(f"=SUM({chr(c)}{start}:{chr(c)}{end})")
        all_data.append(sub)
        format_rules.append({"range": f"A{row}:O{row}", "format": {
            "textFormat": {"bold": True},
            "backgroundColor": {"red": 0.9, "green": 0.9, "blue": 0.9},
        }})
        team_subtotal_rows.append(row)
        row += 1

    # 전체 합계
    total = ["전체 합계", ""]
    for c in range(ord("C"), ord("P")):
        refs = "+".join([f"{chr(c)}{r}" for r in team_subtotal_rows])
        total.append(f"={refs}")
    all_data.append(total)
    format_rules.append({"range": f"A{row}:O{row}", "format": {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.8, "green": 0.85, "blue": 0.95},
    }})

    # 단일 update + 단일 batch_format
    ws.update(values=all_data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format(format_rules)
    return ws


def create_team_total_expense_tab(sh):
    """탭 3: 팀 전체 월별 총지출 — 모든 데이터 한 번에 구성"""
    ws = sh.add_worksheet(title="팀 전체 월별 총지출", rows=15, cols=15)

    all_data = []

    # 행 1: 헤더
    header = ["카테고리"] + MONTHS + ["연간합계", "비율"]
    all_data.append(header)

    # 카테고리 행들
    categories = ["인건비", "외주비", "광고비", "툴비용", "기타"]
    for i, cat in enumerate(categories):
        r = i + 2
        row_data = [cat] + [""] * 12
        row_data.append(f"=SUM(B{r}:M{r})")  # 연간합계
        row_data.append(f"=IF($N$8=0,0,N{r}/$N$8)")  # 비율
        all_data.append(row_data)

    # 전체 합계
    total_row = len(categories) + 2
    total = ["전체 합계"]
    for c in range(ord("B"), ord("N")):
        total.append(f"=SUM({chr(c)}2:{chr(c)}{total_row-1})")
    total.append(f"=SUM(N2:N{total_row-1})")
    total.append("100%")
    all_data.append(total)

    # 단일 update + 단일 batch_format
    ws.update(values=all_data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1:O1", "format": {
            "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.2, "green": 0.4, "blue": 0.7},
        }},
        {"range": f"A{total_row}:O{total_row}", "format": {
            "textFormat": {"bold": True},
            "backgroundColor": {"red": 0.8, "green": 0.85, "blue": 0.95},
        }},
    ])
    return ws


def create_profit_tab(sh):
    """탭 4: 예상 매출 vs 지출 — 월별 수익 (모든 데이터 한 번에 구성)"""
    ws = sh.add_worksheet(title="월별 수익", rows=50, cols=15)

    all_data = []
    format_rules = []

    # 행 1: 헤더
    header = ["팀", "프로젝트"] + MONTHS + ["연간합계"]
    all_data.append(header)
    format_rules.append({"range": "A1:O1", "format": {
        "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
        "backgroundColor": {"red": 0.15, "green": 0.5, "blue": 0.3},
    }})

    # 행 2: 빈 행
    all_data.append([""])

    sections = [
        ("[예상 매출]", 3),
        ("[예상 지출]", 16),
        ("[수익 = 매출 - 지출]", 29),
    ]

    for section_name, start in sections:
        # 빈 행 채우기 (현재 all_data 길이에서 start까지)
        while len(all_data) < start - 1:
            all_data.append([""])

        # 섹션 헤더
        all_data.append([section_name])
        format_rules.append({"range": f"A{start}", "format": {"textFormat": {"bold": True, "fontSize": 11}}})

        row = start + 1
        for team in TEAMS:
            # 팀명 + 프로젝트 자리
            all_data.append([team, "(프로젝트)"])
            row += 1
            # 빈 프로젝트 행 2개
            all_data.append([""])
            all_data.append([""])
            row += 2
            # 팀 소계
            s = row - 3
            e = row - 1
            sub = [f"{team} 소계", ""]
            for c in range(ord("C"), ord("P")):
                sub.append(f"=SUM({chr(c)}{s}:{chr(c)}{e})")
            all_data.append(sub)
            format_rules.append({"range": f"A{row}:O{row}", "format": {"textFormat": {"bold": True}}})
            row += 1

        # 전체 합계
        all_data.append(["전체 합계"])
        format_rules.append({"range": f"A{row}:O{row}", "format": {
            "textFormat": {"bold": True},
            "backgroundColor": {"red": 0.8, "green": 0.85, "blue": 0.95},
        }})

    # 빈 행 채우기
    while len(all_data) < 41:
        all_data.append([""])

    # 누적 수익
    all_data.append(["[누적 수익]"])
    format_rules.append({"range": "A42", "format": {"textFormat": {"bold": True, "fontSize": 11}}})
    all_data.append(["월별 누적"])

    # 단일 update + 단일 batch_format
    ws.update(values=all_data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format(format_rules)
    return ws


def create_team_summary_sheet(share_emails=None):
    client = get_client()
    title = "[2026] 팀 총괄 마스터시트"

    sh = client.create(title)
    print(f"Created: {title}")
    print(f"URL: {sh.url}")

    # 탭 1: 대시보드
    create_dashboard_tab(sh.sheet1)
    time.sleep(3)

    # 탭 2: 프로젝트별 월별 총지출
    create_project_expense_tab(sh)
    time.sleep(3)

    # 탭 3: 팀 전체 월별 총지출
    create_team_total_expense_tab(sh)
    time.sleep(3)

    # 탭 4: 월별 수익
    create_profit_tab(sh)

    # 공유
    if share_emails:
        for email in share_emails:
            sh.share(email.strip(), perm_type="user", role="writer")
            print(f"Shared with: {email.strip()}")

    return sh


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="팀 총괄 마스터시트 생성")
    parser.add_argument("--share", help="공유 이메일 (쉼표 구분)")
    args = parser.parse_args()

    emails = args.share.split(",") if args.share else None
    create_team_summary_sheet(emails)
