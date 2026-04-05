"""GoVenture Forum 신청자 명단 → Google Sheets 업데이트"""

import json
import sys
import urllib.request
from sheets_auth import get_client

# --- Config ---
SPREADSHEET_ID = "1YtOd5pW9ECd_kQggWpk8VojUlpuMXn9PS7R1kBG4NiM"
SHEET_GID = 783826069
SUPABASE_URL = "https://zdcwilegoyuipqunyays.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY3dpbGVnb3l1aXBxdW55YXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA4MTI5NSwiZXhwIjoyMDg3NjU3Mjk1fQ.35tNxTVSwBOC7II6FJIO7lKEVp-bpebAkmxgCwvX30E"
FORUM_ID = "b825ad56-3f31-42b3-9487-f5156c239b60"


def fetch_applicants():
    """Supabase에서 신청자 + 결제 정보 조회"""
    url = (
        f"{SUPABASE_URL}/rest/v1/applicants"
        f"?select=attendee_name,phone,email,company_name,representative_name,"
        f"attendee_position,company_stage,business_field,introduction,purpose,"
        f"status,created_at,payments(status)"
        f"&forum_id=eq.{FORUM_ID}"
        f"&status=neq.cancelled"
        f"&order=attendee_name.asc"
    )
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def pay_status(d):
    p = d.get("payments")
    if isinstance(p, list) and p:
        return "결제완료" if any(x.get("status") == "done" for x in p) else "미결제"
    return "미결제"


def main():
    print("1) Supabase에서 신청자 조회 중...")
    data = fetch_applicants()
    print(f"   → {len(data)}명 조회 완료")

    # 시트용 행 데이터 구성
    header = ["이름", "전화번호", "이메일", "회사명", "대표자명", "직함",
              "기업단계", "사업분야", "회사소개", "참여목적", "결제상태", "신청일"]

    rows = [header]
    for d in data:
        rows.append([
            d.get("attendee_name", ""),
            d.get("phone", ""),
            d.get("email", ""),
            d.get("company_name", ""),
            d.get("representative_name", ""),
            d.get("attendee_position", ""),
            d.get("company_stage", ""),
            d.get("business_field", ""),
            (d.get("introduction") or "").replace("\n", " "),
            (d.get("purpose") or "").replace("\n", " "),
            pay_status(d),
            d.get("created_at", "")[:10],
        ])

    print("2) Google Sheets 인증 중...")
    client = get_client()
    sh = client.open_by_key(SPREADSHEET_ID)

    # GID로 워크시트 찾기
    ws = None
    for sheet in sh.worksheets():
        if sheet.id == SHEET_GID:
            ws = sheet
            break

    if not ws:
        print(f"   ✗ GID {SHEET_GID} 시트를 찾을 수 없습니다.")
        sys.exit(1)

    print(f"   → 시트 '{ws.title}' 찾음")

    print("3) 시트 데이터 업데이트 중...")
    ws.clear()
    ws.update(rows, value_input_option="USER_ENTERED")
    print(f"   → {len(rows)-1}명 데이터 업데이트 완료!")


if __name__ == "__main__":
    main()
