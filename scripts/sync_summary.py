#!/usr/bin/env python3
"""팀 총괄 시트 동기화 스크립트

IMPORTRANGE 승인이 안 되는 프로젝트 시트의 데이터를
API로 직접 읽어서 총괄 시트에 반영한다.

Usage:
    python3 scripts/sync_summary.py
"""

import sys
import time
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

SUMMARY_ID = "19Vlz6i7swopqqXwfrzp1WIkYuys73te7Z0fCevQfaLc"

# 프로젝트 시트 설정
# row: 총괄 시트에서의 행 번호
# sheet_id: 프로젝트 시트 ID
# month_offset: 시작 월 (1=1월부터, 2=2월부터)
# mode: "importrange" (자동 연동) 또는 "api_sync" (수동 동기화)
PROJECTS = {
    "현대차 정몽구 재단": {
        "row": 2,
        "sheet_id": "14sczfUEtT1QiNtAX0BjT9M5k-9j8G0m2NhOVrc5ML2w",
        "month_offset": 1,
        "mode": "importrange",
    },
    "탭샵바": {
        "row": 3,
        "sheet_id": "1XOvH3_0llsFRXb3hpTJFArp37Ts4R8jByVfbVo38AX8",
        "month_offset": 2,  # B열=2월
        "mode": "api_sync",
    },
    "휴닉": {
        "row": 4,
        "sheet_id": "1crkZXjTlFd01vUGoaXs3zpNqgZBLh-xZwpqPQEDHDUY",
        "month_offset": 1,
        "mode": "api_sync",
        # 현대차 스타일 탭 구조 (정산 단위)
        "rev_tab": "예상매출",       # 매출 탭명
        "rev_total_row": 2,         # 합계 row 2
        "rev_month_start_col": 1,   # B열 = index 1 (0-based)
        "exp_tab": "예상지출",       # 지출 탭명
        "exp_total_row": 9,         # 지출 합계 row 9
        "exp_month_start_col": 2,   # C열 = index 2 (0-based)
    },
    "벤처리움": {
        "row": 5,
        "sheet_id": "1MuNdALo0Mo9fGrhXiea_gpCnMMZd6frOn1CPq4KpuTM",
        "month_offset": 1,
        "mode": "importrange",
    },
    "미례국밥": {
        "row": 6,
        "sheet_id": "1PLzHbFhcEmyNk-yxRXlx6hrZPx8810IjhCLU9pSUbdA",
        "month_offset": 1,
        "mode": "api_sync",
        # create_project_sheet.py 표준 구조
        "rev_tab": "2026 예상 매출",
        "rev_total_row": 2,
        "rev_month_start_col": 4,   # E열 = index 4 (A:항목, B:발행일, C:공급가, D:VAT, E:1월~)
        "exp_tab": "2026 예상 지출",
        "exp_total_row": 2,
        "exp_month_start_col": 1,   # B열 = index 1 (A:카테고리, B:1월~) — 탭샵바 스타일
    },
}


def read_project_data(client, project_name, config):
    """프로젝트 시트에서 매출/지출 합계 데이터 읽기

    프로젝트별 탭 구조가 다를 수 있으므로 config에서 탭명/합계행/월시작열을 개별 지정.
    기본값: 기존 구조 (2026 예상 매출/지출, 합계 row 2, 월 시작 col 1)
    """
    if not config["sheet_id"]:
        print(f"  [{project_name}] 시트 ID 없음 — 건너뜀")
        return None, None

    try:
        sh = client.open_by_key(config["sheet_id"])
    except Exception as e:
        print(f"  [{project_name}] 접근 실패: {e}")
        return None, None

    # 탭명/합계행/월시작열 — config에 없으면 기본값 사용
    rev_tab = config.get("rev_tab", "2026 예상 매출")
    rev_total_row = config.get("rev_total_row", 2)
    rev_month_col = config.get("rev_month_start_col", 1)  # 0-based

    exp_tab = config.get("exp_tab", "2026 예상 지출")
    exp_total_row = config.get("exp_total_row", 2)
    exp_month_col = config.get("exp_month_start_col", 1)  # 0-based

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

    # 12개월 값 추출 (1월~12월)
    revenue = [0] * 12
    expense = [0] * 12

    for month_idx in range(12):  # 0=1월, 11=12월
        # 매출: rev_month_col + month_idx
        src_col = rev_month_col + month_idx
        if src_col < len(rev_row):
            val = str(rev_row[src_col]).replace(",", "")
            try:
                revenue[month_idx] = int(float(val))
            except ValueError:
                revenue[month_idx] = 0

        # 지출: exp_month_col + month_idx
        src_col = exp_month_col + month_idx
        if src_col < len(exp_row):
            val = str(exp_row[src_col]).replace(",", "")
            try:
                expense[month_idx] = int(float(val))
            except ValueError:
                expense[month_idx] = 0

    return revenue, expense


def sync_to_summary(client, project_name, config, revenue, expense):
    """총괄 시트에 값 쓰기"""
    sh = client.open_by_key(SUMMARY_ID)
    row = config["row"]

    # 월별 매출 탭
    ws_rev = sh.worksheet("월별 매출")
    write_rev = revenue + [f"=SUM(B{row}:M{row})"]
    ws_rev.update(
        values=[write_rev],
        range_name=f"B{row}:N{row}",
        value_input_option="USER_ENTERED",
    )
    print(f"  [{project_name}] 매출 동기화 완료 (연간: {sum(revenue):,})")
    time.sleep(1)

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
    client = get_client()
    print("=== 팀 총괄 시트 동기화 시작 ===\n")

    for name, config in PROJECTS.items():
        if config["mode"] == "importrange":
            print(f"[{name}] IMPORTRANGE 자동 연동 — 건너뜀")
            continue

        print(f"[{name}] API 동기화 시작...")
        revenue, expense = read_project_data(client, name, config)
        if revenue is not None:
            sync_to_summary(client, name, config, revenue, expense)
        time.sleep(2)

    print("\n=== 동기화 완료 ===")


if __name__ == "__main__":
    main()
