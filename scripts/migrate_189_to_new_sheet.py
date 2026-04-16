#!/usr/bin/env python3
"""189회 참석자 86명을 새 운영시트 '참석자 통합 DB'에 이관

사용법:
  python scripts/migrate_189_to_new_sheet.py
"""

import time
import sys
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

OLD_SHEET_ID = "1YtOd5pW9ECd_kQggWpk8VojUlpuMXn9PS7R1kBG4NiM"
NEW_SHEET_ID = "1xY2GUqv7xdQ2X6tSW4DGq4gEZHNsGADGrpUOqqrv4KA"
OLD_TAB = "✅ 최종 참석자 (0331)"
NEW_TAB = "참석자 통합 DB"


def migrate():
    client = get_client()

    # 1. 기존 시트에서 189회 참석자 읽기
    old_sh = client.open_by_key(OLD_SHEET_ID)
    old_ws = old_sh.worksheet(OLD_TAB)
    old_data = old_ws.get_all_values()

    print(f"Old sheet: {OLD_TAB}")
    print(f"  Header: {old_data[0]}")
    print(f"  Rows: {len(old_data) - 1}")

    # Old columns: No, 이름, 소속, 직책, 연락처, 이메일, 메뉴, 결제상태, 등록구분, 상담, 유형, 비고
    # New columns: 이름, 소속, 직함, 연락처, 이메일, 유형, 첫참석회차, 총참석횟수, 참석회차목록, 뉴스레터구독, 상담이력, 태그, 최근참석일, 비고

    new_rows = []
    for row in old_data[1:]:  # skip header
        if len(row) < 2 or not row[1].strip():
            continue  # skip empty rows

        name = row[1].strip() if len(row) > 1 else ""
        company = row[2].strip() if len(row) > 2 else ""
        title = row[3].strip() if len(row) > 3 else ""
        phone = row[4].strip() if len(row) > 4 else ""
        email = row[5].strip() if len(row) > 5 else ""
        consultation = row[9].strip() if len(row) > 9 else ""
        participant_type = row[10].strip() if len(row) > 10 else ""
        note = row[11].strip() if len(row) > 11 else ""

        # 상담 이력 변환
        consultation_note = ""
        if consultation and consultation not in ("-", ""):
            consultation_note = f"189회: {consultation}"

        # 태그 추론
        tags = []
        if "VC" in participant_type or "투자" in participant_type:
            tags.append("투자자")
        if "기관" in participant_type:
            tags.append("기관")

        new_row = [
            name,
            company,
            title,
            phone,
            email,
            participant_type,
            "189",           # 첫 참석 회차
            "1",             # 총 참석 횟수
            "189",           # 참석 회차 목록
            "",              # 뉴스레터 구독 (미확인)
            consultation_note,
            ", ".join(tags),
            "2026-03-31",    # 최근 참석일
            note,
        ]
        new_rows.append(new_row)

    print(f"\n  Converted: {len(new_rows)} rows")

    # 2. 새 시트에 쓰기
    new_sh = client.open_by_key(NEW_SHEET_ID)
    new_ws = new_sh.worksheet(NEW_TAB)

    # 가이드 행(A2) 아래인 A3부터 시작
    if new_rows:
        new_ws.update(
            values=new_rows,
            range_name=f"A3:N{2 + len(new_rows)}",
            value_input_option="USER_ENTERED",
        )
        print(f"\n  Written {len(new_rows)} rows to '{NEW_TAB}' (A3~A{2 + len(new_rows)})")

    print(f"\nDone! Open: {new_sh.url}")


if __name__ == "__main__":
    migrate()
