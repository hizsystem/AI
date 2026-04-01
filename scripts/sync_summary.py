#!/usr/bin/env python3
"""팀 총괄 시트 동기화 스크립트

config/projects.json에서 프로젝트 목록을 읽어
각 프로젝트 마스터시트의 매출/지출 데이터를 총괄 시트에 반영한다.

지원 구조:
  - standard: 표준 마스터시트 (매출/지출 탭, 합계 행에서 월별 열 읽기)
  - custom: 커스텀 탭명/행/열 지정 (standard와 같은 방식, 다른 위치)
  - expense_log: 수직 로그 형태 (월별 소계를 텍스트 검색으로 읽기)

Usage:
    python3 scripts/sync_summary.py              # 전체 동기화
    python3 scripts/sync_summary.py --only 휴닉   # 특정 프로젝트만
"""

import argparse
import json
import sys
import time
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

CONFIG_PATH = "config/projects.json"

MONTH_NAMES = ["1월", "2월", "3월", "4월", "5월", "6월",
               "7월", "8월", "9월", "10월", "11월", "12월"]


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def get_structure_config(project, standard):
    """프로젝트의 시트 구조 설정을 반환한다."""
    if project.get("structure") in ("custom", "expense_log"):
        return project["custom_config"]
    return standard


def parse_amount(val):
    """문자열 금액을 정수로 변환한다."""
    val = str(val).replace(",", "").strip()
    try:
        return int(float(val))
    except ValueError:
        return 0


def read_expense_log(client, project_name, sheet_id, config):
    """수직 로그 형태의 지출 시트에서 월별 소계를 읽는다.

    "N월 소계" 텍스트를 검색하여 해당 행의 금액 열 값을 가져온다.
    """
    try:
        sh = client.open_by_key(sheet_id)
        ws = sh.worksheet(config["exp_tab"])
    except Exception as e:
        print(f"  [{project_name}] 지출 탭 접근 실패: {e}")
        return None, None

    amount_col = config.get("amount_col", 4)  # 0-based, 기본 E열
    search_key = config.get("search_key", "소계")

    data = ws.get_all_values()
    expense = [0] * 12

    for row in data:
        for month_idx, month_name in enumerate(MONTH_NAMES):
            target = f"{month_name} {search_key}"
            # B열(index 1)에서 소계 텍스트 검색
            if len(row) > 1 and target in str(row[1]):
                if len(row) > amount_col:
                    expense[month_idx] = parse_amount(row[amount_col])
                break

    revenue = [0] * 12  # 매출 없음
    return revenue, expense


def read_project_data(client, project_name, sheet_id, structure):
    """표준/커스텀 구조의 프로젝트 시트에서 매출/지출 합계 읽기"""
    if not sheet_id:
        print(f"  [{project_name}] 시트 ID 없음 — 건너뜀")
        return None, None

    try:
        sh = client.open_by_key(sheet_id)
    except Exception as e:
        print(f"  [{project_name}] 접근 실패: {e}")
        return None, None

    rev_tab = structure["rev_tab"]
    rev_total_row = structure["rev_total_row"]
    rev_month_col = structure["rev_month_start_col"]

    exp_tab = structure["exp_tab"]
    exp_total_row = structure["exp_total_row"]
    exp_month_col = structure["exp_month_start_col"]

    # 매출 탭
    try:
        ws_rev = sh.worksheet(rev_tab)
        rev_row = ws_rev.row_values(rev_total_row)
    except Exception as e:
        print(f"  [{project_name}] 매출 탭 '{rev_tab}' 접근 실패: {e}")
        rev_row = []

    # 지출 탭
    try:
        ws_exp = sh.worksheet(exp_tab)
        exp_row = ws_exp.row_values(exp_total_row)
    except Exception as e:
        print(f"  [{project_name}] 지출 탭 '{exp_tab}' 접근 실패: {e}")
        exp_row = []

    # 12개월 값 추출
    revenue = [0] * 12
    expense = [0] * 12

    for month_idx in range(12):
        src_col = rev_month_col + month_idx
        if src_col < len(rev_row):
            revenue[month_idx] = parse_amount(rev_row[src_col])

        src_col = exp_month_col + month_idx
        if src_col < len(exp_row):
            expense[month_idx] = parse_amount(exp_row[src_col])

    return revenue, expense


def sync_to_summary(client, summary_id, project_name, row, revenue, expense,
                    has_revenue=True):
    """총괄 시트에 값 쓰기"""
    sh = client.open_by_key(summary_id)

    # 월별 매출 탭
    if has_revenue:
        ws_rev = sh.worksheet("월별 매출")
        write_rev = revenue + [f"=SUM(B{row}:M{row})"]
        ws_rev.update(
            values=[write_rev],
            range_name=f"B{row}:N{row}",
            value_input_option="USER_ENTERED",
        )
        print(f"  [{project_name}] 매출 동기화 완료 (연간: {sum(revenue):,})")
        time.sleep(1)
    else:
        print(f"  [{project_name}] 매출 없음 — 건너뜀")

    # 월별 지출 탭
    ws_exp = sh.worksheet("월별 지출")
    write_exp = expense + [f"=SUM(B{row}:M{row})"]
    ws_exp.update(
        values=[write_exp],
        range_name=f"B{row}:N{row}",
        value_input_option="USER_ENTERED",
    )
    print(f"  [{project_name}] 지출 동기화 완료 (연간: {sum(expense):,})")


def main():
    parser = argparse.ArgumentParser(description="팀 총괄 시트 동기화")
    parser.add_argument("--only", help="특정 프로젝트만 동기화")
    args = parser.parse_args()

    config = load_config()
    client = get_client()
    summary_id = config["summary_sheet_id"]
    standard = config["standard_structure"]

    print("=== 팀 총괄 시트 동기화 시작 ===\n")

    for project in config["projects"]:
        name = project["name"]

        if args.only and args.only != name:
            continue

        if project["mode"] == "importrange":
            print(f"[{name}] IMPORTRANGE 자동 연동 — 건너뜀")
            continue

        if not project.get("sheet_id"):
            print(f"[{name}] 시트 ID 없음 — 건너뜀")
            continue

        print(f"[{name}] API 동기화 시작...")

        # 구조 유형에 따라 읽기 방식 분기
        if project.get("structure") == "expense_log":
            structure = project["custom_config"]
            revenue, expense = read_expense_log(
                client, name, project["sheet_id"], structure)
        else:
            structure = get_structure_config(project, standard)
            revenue, expense = read_project_data(
                client, name, project["sheet_id"], structure)

        if revenue is not None:
            has_revenue = project.get("revenue", True)
            sync_to_summary(client, summary_id, name, project["row"],
                            revenue, expense, has_revenue)
        time.sleep(2)

    print("\n=== 동기화 완료 ===")


if __name__ == "__main__":
    main()
