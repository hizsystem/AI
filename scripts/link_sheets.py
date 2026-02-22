#!/usr/bin/env python3
"""프로젝트 시트 ↔ 팀 총괄 시트 IMPORTRANGE 연동 스크립트

프로젝트 마스터시트의 지출/매출 데이터를 팀 총괄 시트에 연결한다.
첫 연동 시, 구글시트 UI에서 '액세스 허용'을 한 번 눌러줘야 IMPORTRANGE가 동작한다.
"""

import argparse
import time
import sys
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client, MONTHS

TEAMS = ["1팀", "2팀", "3팀"]

# 팀별 프로젝트별 월별 총지출 탭에서 각 팀의 프로젝트 시작행
# 구조: 헤더(1행) + 팀당 4행 프로젝트 + 1행 소계
TEAM_EXPENSE_START = {"1팀": 2, "2팀": 7, "3팀": 12}  # 각 팀 첫 번째 프로젝트 행

# 월별 수익 탭에서 각 섹션/팀의 시작행
PROFIT_SECTION_START = {
    "매출": {"1팀": 4, "2팀": 8, "3팀": 12},
    "지출": {"1팀": 17, "2팀": 21, "3팀": 25},
}


def find_empty_slot(ws, start_row, max_slots=4, col="B"):
    """팀의 프로젝트 슬롯 중 빈 자리를 찾는다."""
    range_str = f"{col}{start_row}:{col}{start_row + max_slots - 1}"
    values = ws.get(range_str)
    for i, row in enumerate(values):
        if not row or not row[0] or row[0] == "(프로젝트 추가)" or row[0] == "(프로젝트)":
            return start_row + i
    return None


def link_project_to_summary(summary_key, project_key, team, project_name):
    """프로젝트 시트를 팀 총괄 시트에 IMPORTRANGE로 연동"""
    client = get_client()

    summary_sh = client.open_by_key(summary_key)
    project_url = f"https://docs.google.com/spreadsheets/d/{project_key}"

    print(f"Linking: {project_name} ({team}) → 팀 총괄 시트")

    # === 1. 프로젝트별 월별 총지출 탭 ===
    expense_ws = summary_sh.worksheet("프로젝트별 월별 총지출")
    start_row = TEAM_EXPENSE_START.get(team)
    if not start_row:
        print(f"Error: {team} not found in TEAM_EXPENSE_START")
        return

    slot_row = find_empty_slot(expense_ws, start_row)
    if slot_row is None:
        print(f"Warning: {team}의 프로젝트 슬롯이 가득 찼습니다.")
        return

    # 프로젝트명 + 각 월별 IMPORTRANGE 수식
    # 프로젝트 시트의 "2026 예상 지출" 탭에서 월별 총합계(행 2, D~O열)를 가져옴
    row_data = [team, project_name]
    for i, col in enumerate(range(ord("D"), ord("P"))):  # D~O = 1월~12월
        col_letter = chr(col)
        row_data.append(f"=IMPORTRANGE(\"{project_url}\",\"2026 예상 지출!{col_letter}2\")")
    # 연간합계
    sum_cols = [chr(c) for c in range(ord("C"), ord("O"))]
    row_data.append(f"=SUM({sum_cols[0]}{slot_row}:{sum_cols[-1]}{slot_row})")

    expense_ws.update(values=[row_data], range_name=f"A{slot_row}", value_input_option="USER_ENTERED")
    print(f"  ✓ 프로젝트별 월별 총지출 → 행 {slot_row}")
    time.sleep(2)

    # === 2. 월별 수익 탭 - 매출 섹션 ===
    profit_ws = summary_sh.worksheet("월별 수익")

    # 매출 슬롯
    revenue_start = PROFIT_SECTION_START["매출"].get(team)
    revenue_slot = find_empty_slot(profit_ws, revenue_start, max_slots=3)
    if revenue_slot:
        rev_data = [team, project_name]
        for col in range(ord("C"), ord("O")):
            col_letter = chr(col)
            # 프로젝트 시트의 "2026 예상 매출" 탭에서 월별 합계(행 2, E~P열)를 가져옴
            src_col = chr(col - ord("C") + ord("E"))  # C→E, D→F, ...
            rev_data.append(f"=IMPORTRANGE(\"{project_url}\",\"2026 예상 매출!{src_col}2\")")
        rev_data.append(f"=SUM(C{revenue_slot}:N{revenue_slot})")
        profit_ws.update(values=[rev_data], range_name=f"A{revenue_slot}", value_input_option="USER_ENTERED")
        print(f"  ✓ 월별 수익 (매출) → 행 {revenue_slot}")
    time.sleep(2)

    # 지출 슬롯
    expense_start = PROFIT_SECTION_START["지출"].get(team)
    expense_slot = find_empty_slot(profit_ws, expense_start, max_slots=3)
    if expense_slot:
        exp_data = [team, project_name]
        for col in range(ord("C"), ord("O")):
            col_letter = chr(col)
            src_col = chr(col - ord("C") + ord("D"))  # C→D, D→E, ...
            exp_data.append(f"=IMPORTRANGE(\"{project_url}\",\"2026 예상 지출!{src_col}2\")")
        exp_data.append(f"=SUM(C{expense_slot}:N{expense_slot})")
        profit_ws.update(values=[exp_data], range_name=f"A{expense_slot}", value_input_option="USER_ENTERED")
        print(f"  ✓ 월별 수익 (지출) → 행 {expense_slot}")

    print(f"\n연동 완료! 구글시트에서 '{project_name}' IMPORTRANGE 셀에 '액세스 허용'을 눌러주세요.")
    print(f"팀 총괄 시트: https://docs.google.com/spreadsheets/d/{summary_key}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="프로젝트 ↔ 팀 총괄 IMPORTRANGE 연동")
    parser.add_argument("--summary-key", required=True, help="팀 총괄 시트 키 (URL의 /d/ 뒤 부분)")
    parser.add_argument("--project-key", required=True, help="프로젝트 시트 키")
    parser.add_argument("--team", required=True, choices=TEAMS, help="담당 팀명")
    parser.add_argument("--name", required=True, help="프로젝트명")
    args = parser.parse_args()

    link_project_to_summary(args.summary_key, args.project_key, args.team, args.name)
