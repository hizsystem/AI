#!/usr/bin/env python3
"""3/31 리셉션 명단(구글시트) → Supabase 참석 데이터 싱크

1. 시트의 ★리셉션_명단 읽기
2. DB 기존 신청자와 매칭 (이메일 or 전화번호)
3. 매칭된 사람: attended=true + 메뉴/상담/비고 업데이트
4. 매칭 안 된 사람(현장추가): 새 레코드 INSERT
5. 시트에 있는데 DB에 없는 사전등록자: 그대로 attended=false

사용법:
  cd /Users/wooseongmin/AI
  python3 .claude/worktrees/goventure-forum/scripts/sync_attendance_to_supabase.py [--dry-run]
"""

import sys, json, argparse, requests

# ── 설정 ──
SUPABASE_URL = "https://zdcwilegoyuipqunyays.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkY3dpbGVnb3l1aXBxdW55YXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA4MTI5NSwiZXhwIjoyMDg3NjU3Mjk1fQ.35tNxTVSwBOC7II6FJIO7lKEVp-bpebAkmxgCwvX30E"
FORUM_ID = "b825ad56-3f31-42b3-9487-f5156c239b60"

SHEET_URL = "https://docs.google.com/spreadsheets/d/1YtOd5pW9ECd_kQggWpk8VojUlpuMXn9PS7R1kBG4NiM/edit"
SHEET_GID = 1110496034  # ★리셉션_명단

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}


def normalize_phone(phone):
    """전화번호 정규화: 숫자만 추출"""
    return "".join(c for c in str(phone) if c.isdigit())


def read_sheet():
    """구글시트에서 리셉션 명단 읽기"""
    from google.oauth2.credentials import Credentials
    import gspread

    TOKEN_PATH = ".secrets/token.json"
    with open(TOKEN_PATH) as f:
        token_data = json.load(f)
    creds = Credentials(
        token=token_data["token"],
        refresh_token=token_data["refresh_token"],
        token_uri=token_data["token_uri"],
        client_id=token_data["client_id"],
        client_secret=token_data["client_secret"],
        scopes=token_data["scopes"],
    )
    client = gspread.authorize(creds)
    sh = client.open_by_url(SHEET_URL)

    ws = None
    for w in sh.worksheets():
        if w.id == SHEET_GID:
            ws = w
            break

    raw = ws.get_all_values()
    attendees = []
    for row in raw[1:]:  # skip header
        num = row[0].strip()
        name = row[1].strip()
        org = row[2].strip()
        position = row[3].strip()
        phone = row[4].strip()
        email = row[5].strip()
        menu = row[6].strip()
        payment = row[7].strip()
        pos_guide = row[8].strip()
        consultation = row[9].strip()
        pre_paid = row[10].strip()
        note = row[11].strip() if len(row) > 11 else ""

        if not num and not name:
            continue
        if not name or name in ("현장 업데이트",):
            continue
        if name.startswith("사전 결제"):
            continue
        if name.startswith("탭샵바 결제"):
            continue

        # #29 수정
        if name == "37" and org == "비해브":
            name = "이경석"

        try:
            n = int(num)
            reg_type = "pre_registered" if n <= 61 else "walk_in"
        except ValueError:
            reg_type = "walk_in"

        # 메뉴 정리
        if not menu or menu == "확인":
            menu = None
        menu_map = {"와인": "wine", "커피": "coffee"}
        menu_en = menu_map.get(menu, menu)

        attendees.append({
            "name": name,
            "org": org,
            "position": position,
            "phone": phone,
            "email": email.lower().strip(),
            "phone_norm": normalize_phone(phone),
            "menu": menu_en,
            "payment": payment,
            "consultation": consultation,
            "reg_type": reg_type,
            "note": note,
            "pre_paid": pre_paid,
        })

    return attendees


def get_db_applicants():
    """Supabase에서 현재 신청자 목록 조회"""
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/applicants?forum_id=eq.{FORUM_ID}&select=*",
        headers=HEADERS,
    )
    r.raise_for_status()
    applicants = r.json()

    # 매칭용 인덱스 구축
    by_email = {}
    by_phone = {}
    for a in applicants:
        email = (a.get("email") or "").lower().strip()
        phone = normalize_phone(a.get("phone") or "")
        if email:
            by_email[email] = a
        if phone:
            by_phone[phone] = a

    return applicants, by_email, by_phone


def run_migration(dry_run=False):
    """마이그레이션 SQL 실행 (Supabase SQL endpoint)"""
    sql_path = ".claude/worktrees/goventure-forum/goventureforum/supabase/migrations/003_add_attendance_columns.sql"
    with open(sql_path) as f:
        sql = f.read()

    if dry_run:
        print("[DRY-RUN] 마이그레이션 스킵")
        return True

    # Supabase SQL endpoint (service role)
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
        headers=HEADERS,
        json={"query": sql},
    )

    # If rpc doesn't exist, try direct SQL via management API
    if r.status_code == 404:
        # Split and run each statement individually via PostgREST
        print("  rpc/exec_sql 없음 → 개별 쿼리 실행은 Supabase 대시보드에서 수동 실행 필요")
        return False

    if r.status_code == 200:
        print("✅ 마이그레이션 성공")
        return True
    else:
        print(f"⚠️ 마이그레이션 응답: {r.status_code} {r.text[:200]}")
        return False


def update_applicant(applicant_id, data, dry_run=False):
    """기존 신청자 업데이트"""
    if dry_run:
        print(f"  [DRY-RUN] UPDATE {applicant_id}: {data}")
        return True

    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/applicants?id=eq.{applicant_id}",
        headers=HEADERS,
        json=data,
    )
    return r.status_code in (200, 204)


def insert_applicant(data, dry_run=False):
    """현장 추가 신청자 INSERT"""
    if dry_run:
        print(f"  [DRY-RUN] INSERT: {data['attendee_name']} ({data['company_name']})")
        return True

    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/applicants",
        headers=HEADERS,
        json=data,
    )
    if r.status_code in (200, 201):
        return True
    else:
        print(f"  ⚠️ INSERT 실패: {r.status_code} {r.text[:200]}")
        return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="실제 DB 변경 없이 확인만")
    parser.add_argument("--skip-migration", action="store_true", help="마이그레이션 건너뛰기")
    args = parser.parse_args()

    print("=" * 60)
    print("3/31 고벤처포럼 참석 데이터 → Supabase 싱크")
    print("=" * 60)

    # 1. 마이그레이션
    if not args.skip_migration:
        print("\n[1/4] 스키마 마이그레이션...")
        migration_ok = run_migration(args.dry_run)
        if not migration_ok and not args.dry_run:
            print("⚠️ 마이그레이션을 Supabase SQL Editor에서 수동 실행하세요.")
            print("   파일: goventureforum/supabase/migrations/003_add_attendance_columns.sql")
            print("   --skip-migration 플래그로 다시 실행하세요.")
            return
    else:
        print("\n[1/4] 마이그레이션 건너뛰기")

    # 2. 시트 데이터 읽기
    print("\n[2/4] 구글시트 읽기...")
    sheet_attendees = read_sheet()
    print(f"  시트 참석자: {len(sheet_attendees)}명")

    # 중복 제거 (전화번호 기준)
    seen = set()
    unique_attendees = []
    for a in sheet_attendees:
        key = a["phone_norm"] or a["email"]
        if key and key in seen:
            continue
        if key:
            seen.add(key)
        unique_attendees.append(a)
    print(f"  중복 제거 후: {len(unique_attendees)}명")

    # 3. DB 데이터 읽기
    print("\n[3/4] Supabase 데이터 읽기...")
    db_applicants, by_email, by_phone = get_db_applicants()
    print(f"  DB 신청자: {len(db_applicants)}명")

    # 4. 매칭 & 싱크
    print("\n[4/4] 싱크 시작...")
    matched = 0
    inserted = 0
    not_matched = []

    for a in unique_attendees:
        # 매칭: 이메일 우선, 전화번호 차선
        db_record = None
        if a["email"]:
            db_record = by_email.get(a["email"])
        if not db_record and a["phone_norm"]:
            db_record = by_phone.get(a["phone_norm"])

        if db_record:
            # 기존 레코드 업데이트
            update_data = {
                "attended": True,
                "menu_choice": a["menu"],
                "consultation": a["consultation"] if a["consultation"] else None,
                "reg_type": a["reg_type"],
                "admin_note": a["note"] if a["note"] else None,
            }
            if update_applicant(db_record["id"], update_data, args.dry_run):
                matched += 1
            else:
                print(f"  ⚠️ 업데이트 실패: {a['name']}")
        else:
            # 현장 추가 → INSERT
            insert_data = {
                "forum_id": FORUM_ID,
                "company_name": a["org"] or "미입력",
                "representative_name": a["name"],
                "attendee_name": a["name"],
                "attendee_position": a["position"] or None,
                "email": a["email"] or f"unknown_{a['name']}@walk-in",
                "phone": a["phone"] or "",
                "source": "walk_in",
                "status": "confirmed",
                "attended": True,
                "menu_choice": a["menu"],
                "consultation": a["consultation"] if a["consultation"] else None,
                "reg_type": "walk_in",
                "admin_note": a["note"] if a["note"] else None,
            }
            if insert_applicant(insert_data, args.dry_run):
                inserted += 1
            else:
                not_matched.append(a)

    # 결과 출력
    print("\n" + "=" * 60)
    print("싱크 결과")
    print("=" * 60)
    print(f"  매칭 & 업데이트: {matched}명")
    print(f"  현장추가 INSERT: {inserted}명")
    if not_matched:
        print(f"  실패: {len(not_matched)}명")
        for a in not_matched:
            print(f"    - {a['name']} ({a['org']})")

    # DB 미참석자 안내
    attended_emails = {a["email"] for a in unique_attendees if a["email"]}
    attended_phones = {a["phone_norm"] for a in unique_attendees if a["phone_norm"]}
    no_show = 0
    for db_a in db_applicants:
        e = (db_a.get("email") or "").lower().strip()
        p = normalize_phone(db_a.get("phone") or "")
        if e not in attended_emails and p not in attended_phones:
            no_show += 1
    print(f"\n  DB 등록 but 미참석(노쇼): ~{no_show}명")
    print(f"  (이 사람들은 attended=false로 유지)")


if __name__ == "__main__":
    main()
