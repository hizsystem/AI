#!/usr/bin/env python3
"""참석자 명단 아카이빙 탭 추가 + 온오프믹스 데이터 임포트"""

import argparse
import sys
import time

sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

import xlrd


SHEET_URL = "https://docs.google.com/spreadsheets/d/1YtOd5pW9ECd_kQggWpk8VojUlpuMXn9PS7R1kBG4NiM/edit"
TAB_NAME = "참석자 명단"


def read_onoffmix_xls(filepath):
    """온오프믹스 XLS 파일에서 참가자 데이터 추출"""
    wb = xlrd.open_workbook(filepath, ignore_workbook_corruption=True)
    ws = wb.sheet_by_index(0)

    # 이벤트 제목 (Row 1)
    event_title = ws.cell_value(1, 0)

    participants = []
    for r in range(5, ws.nrows):
        row = [ws.cell_value(r, c) for c in range(ws.ncols)]
        # 번호가 숫자가 아니거나 이름이 없으면 스킵 (결제 요약 행 등 제외)
        if not row[0] or not isinstance(row[0], (int, float)) or not row[2]:
            continue
        participants.append({
            "no": int(row[0]),
            "name": row[2],
            "org": row[3],
            "phone": row[4],
            "email": row[5],
            "count": int(row[6]) if isinstance(row[6], (int, float)) else 1,
            "confirmed": row[8],
            "date": row[10],
            "time": row[11],
        })

    return event_title, participants


def create_or_get_tab(sh):
    """참석자 명단 탭이 있으면 가져오고, 없으면 생성"""
    try:
        ws = sh.worksheet(TAB_NAME)
        print(f"기존 탭 '{TAB_NAME}' 사용")
        return ws, False
    except Exception:
        ws = sh.add_worksheet(title=TAB_NAME, rows=500, cols=12)
        print(f"새 탭 '{TAB_NAME}' 생성")
        return ws, True


def setup_headers(ws):
    """헤더 설정"""
    headers = [
        "No", "회차", "모집채널", "이름", "소속",
        "전화", "이메일", "신청인원", "참여확정",
        "신청일", "비고"
    ]
    ws.update(values=[headers], range_name="A1")
    ws.batch_format([
        {"range": "A1:K1", "format": {
            "textFormat": {
                "bold": True,
                "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}},
            },
            "backgroundColor": {"red": 0.2, "green": 0.3, "blue": 0.6},
            "horizontalAlignment": "CENTER",
        }},
    ])
    # 열 너비 조정은 API v4에서 별도 처리 필요
    return headers


def append_participants(ws, participants, event_name, channel, start_row):
    """참석자 데이터 추가"""
    rows = []
    for i, p in enumerate(participants):
        rows.append([
            start_row + i - 1,  # No (연속 번호)
            event_name,         # 회차
            channel,            # 모집채널
            p["name"],
            p["org"],
            p["phone"],
            p["email"],
            p["count"],
            p["confirmed"],
            p["date"],
            "",                 # 비고
        ])

    ws.update(
        values=rows,
        range_name=f"A{start_row}",
        value_input_option="USER_ENTERED",
    )
    return len(rows)


def main():
    parser = argparse.ArgumentParser(description="참석자 명단 탭 추가 + 데이터 임포트")
    parser.add_argument("--xls", required=True, help="온오프믹스 XLS 파일 경로")
    parser.add_argument("--event", help="회차/이벤트명 (미지정 시 XLS 제목 사용)")
    parser.add_argument("--channel", default="온오프믹스", help="모집채널 (기본: 온오프믹스)")
    args = parser.parse_args()

    # 1. XLS 데이터 읽기
    event_title, participants = read_onoffmix_xls(args.xls)
    event_name = args.event or event_title
    print(f"이벤트: {event_name}")
    print(f"참가자: {len(participants)}명")

    # 2. 스프레드시트 열기
    client = get_client()
    sh = client.open_by_url(SHEET_URL)

    # 3. 탭 생성/가져오기
    ws, is_new = create_or_get_tab(sh)

    if is_new:
        setup_headers(ws)
        start_row = 2
    else:
        # 기존 데이터 다음 행부터
        existing = ws.get_all_values()
        start_row = len(existing) + 1
        # 빈 행 하나 추가 (채널 구분)
        if start_row > 2:
            start_row += 1

    time.sleep(1)

    # 4. 데이터 입력
    count = append_participants(
        ws, participants, event_name, args.channel, start_row
    )
    print(f"\n✅ {count}명 데이터 입력 완료 (행 {start_row}~{start_row + count - 1})")
    print(f"📊 시트: {sh.url}")


if __name__ == "__main__":
    main()
