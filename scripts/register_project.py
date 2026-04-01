#!/usr/bin/env python3
"""신규 프로젝트 원커맨드 등록

마스터시트 생성 → config 등록 → 총괄시트 연동을 한 번에 처리한다.
NP(네이버플레이스) 프로젝트는 공유용 시트도 함께 생성한다.

Usage:
    # 일반 프로젝트
    python3 scripts/register_project.py --name "파울라너" --team "3팀"

    # NP 프로젝트 (내부용 + 공유용)
    python3 scripts/register_project.py --name "명동식당" --team "3팀" --type np --owner "박사장"

    # 공유용만 추가 (이미 내부용 있는 NP 프로젝트)
    python3 scripts/register_project.py --name "미례국밥" --type np --owner "김미례" --client-only

    # 내부용만 (공유용 불필요)
    python3 scripts/register_project.py --name "고벤처포럼" --team "3팀"

    # 이메일 공유 + IMPORTRANGE 모드
    python3 scripts/register_project.py --name "파울라너" --team "3팀" --share "client@email.com" --mode importrange
"""

import argparse
import json
import sys
import time
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

CONFIG_PATH = "config/projects.json"


def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)


def save_config(config):
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def next_row(config):
    """총괄 시트에서 다음 빈 행 번호를 반환한다."""
    used_rows = [p["row"] for p in config["projects"]]
    return max(used_rows) + 1 if used_rows else 2


def add_to_summary_sheet(client, summary_id, project_name, row):
    """총괄 시트의 월별 매출/지출 탭에 프로젝트명을 추가한다."""
    sh = client.open_by_key(summary_id)
    for tab_name in ["월별 매출", "월별 지출"]:
        try:
            ws = sh.worksheet(tab_name)
            ws.update(
                values=[[project_name]],
                range_name=f"A{row}",
                value_input_option="USER_ENTERED",
            )
            print(f"  총괄시트 '{tab_name}' 탭 행 {row}에 등록")
            time.sleep(1)
        except Exception as e:
            print(f"  총괄시트 '{tab_name}' 등록 실패: {e}")


def link_importrange(client, summary_id, project_key, row):
    """총괄 시트에 IMPORTRANGE 수식을 설정한다."""
    sh = client.open_by_key(summary_id)
    project_url = f"https://docs.google.com/spreadsheets/d/{project_key}"

    ws_rev = sh.worksheet("월별 매출")
    rev_data = []
    for i in range(12):
        src_col = chr(ord("E") + i)
        rev_data.append(f'=IMPORTRANGE("{project_url}","2026 예상 매출!{src_col}2")')
    rev_data.append(f"=SUM(B{row}:M{row})")
    ws_rev.update(values=[rev_data], range_name=f"B{row}:N{row}", value_input_option="USER_ENTERED")
    print("  총괄시트 매출 IMPORTRANGE 연동 완료")
    time.sleep(2)

    ws_exp = sh.worksheet("월별 지출")
    exp_data = []
    for i in range(12):
        src_col = chr(ord("D") + i)
        exp_data.append(f'=IMPORTRANGE("{project_url}","2026 예상 지출!{src_col}2")')
    exp_data.append(f"=SUM(B{row}:M{row})")
    ws_exp.update(values=[exp_data], range_name=f"B{row}:N{row}", value_input_option="USER_ENTERED")
    print("  총괄시트 지출 IMPORTRANGE 연동 완료")


def main():
    parser = argparse.ArgumentParser(description="프로젝트 원커맨드 등록")
    parser.add_argument("--name", required=True, help="프로젝트명")
    parser.add_argument("--team", default="3팀", help="담당 팀명 (기본: 3팀)")
    parser.add_argument("--type", default="general", choices=["general", "np"],
                        help="프로젝트 유형 (기본: general)")
    parser.add_argument("--owner", help="NP 매장 대표 이름 (--type np일 때)")
    parser.add_argument("--share", help="공유 이메일 (쉼표 구분)")
    parser.add_argument("--mode", default="api_sync", choices=["api_sync", "importrange"],
                        help="동기화 방식 (기본: api_sync)")
    parser.add_argument("--client-only", action="store_true",
                        help="공유용 시트만 생성 (이미 내부용이 있을 때)")
    args = parser.parse_args()

    config = load_config()
    summary_id = config["summary_sheet_id"]
    emails = args.share.split(",") if args.share else None

    # 기존 프로젝트 찾기
    existing = None
    for p in config["projects"]:
        if p["name"] == args.name:
            existing = p
            break

    # ── 공유용만 추가하는 경우 ──
    if args.client_only:
        if not existing:
            print(f"Error: '{args.name}'이 config에 없습니다. 먼저 내부용을 등록하세요.")
            sys.exit(1)
        if args.type != "np":
            print("Error: --client-only는 --type np와 함께 사용하세요.")
            sys.exit(1)
        if not args.owner:
            print("Error: NP 공유용 시트에는 --owner가 필요합니다.")
            sys.exit(1)

        print(f"=== NP 공유용 시트 추가: {args.name} ===\n")
        from scripts.create_np_client_sheet import create_np_client_sheet
        client_sh = create_np_client_sheet(args.name, args.owner, emails)
        existing["client_sheet_id"] = client_sh.id
        existing.pop("note", None)
        save_config(config)
        print(f"\n공유용 시트: {client_sh.url}")
        return

    # ── 신규 프로젝트 등록 ──
    if existing and existing.get("sheet_id"):
        print(f"Error: '{args.name}'은 이미 내부용 시트가 있습니다.")
        print(f"공유용만 추가하려면: --client-only --type np --owner \"대표이름\"")
        sys.exit(1)

    row = existing["row"] if existing else next_row(config)

    print(f"=== 프로젝트 등록: {args.name} ===\n")

    # 1. 내부용 마스터시트 생성
    print("[1/3] 내부용 마스터시트 생성 중...")
    from scripts.create_project_sheet import create_project_sheet
    sh = create_project_sheet(args.name, args.team, emails)
    sheet_id = sh.id
    print(f"  시트 ID: {sheet_id}")
    print(f"  URL: {sh.url}\n")
    time.sleep(3)

    # 2. config 등록/업데이트
    print("[2/3] config/projects.json 등록 중...")
    if existing:
        existing["sheet_id"] = sheet_id
        existing.pop("note", None)
    else:
        new_project = {
            "name": args.name,
            "team": args.team,
            "sheet_id": sheet_id,
            "row": row,
            "mode": args.mode,
            "structure": "standard",
            "type": args.type,
        }
        config["projects"].append(new_project)
        existing = new_project
    save_config(config)
    print(f"  행 {row}에 등록 완료\n")

    # 3. 총괄시트 연동
    print("[3/3] 총괄시트 연동 중...")
    client = get_client()
    add_to_summary_sheet(client, summary_id, args.name, row)

    if args.mode == "importrange":
        time.sleep(2)
        link_importrange(client, summary_id, sheet_id, row)
        print("\n  * 구글시트에서 IMPORTRANGE '액세스 허용'을 눌러주세요.")
    else:
        print("  api_sync 모드 — sync_summary.py 실행 시 자동 동기화됩니다.")

    # 4. NP 공유용 시트 (--type np && --owner)
    if args.type == "np" and args.owner:
        print(f"\n[+] NP 공유용 시트 생성 중...")
        time.sleep(3)
        from scripts.create_np_client_sheet import create_np_client_sheet
        client_sh = create_np_client_sheet(args.name, args.owner, emails)
        existing["client_sheet_id"] = client_sh.id
        save_config(config)
        print(f"  공유용: {client_sh.url}")

    # 결과 출력
    print(f"\n=== 등록 완료: {args.name} ===")
    print(f"내부용: {sh.url}")
    print(f"총괄: https://docs.google.com/spreadsheets/d/{summary_id}")
    if args.type == "np" and args.owner:
        print(f"공유용: 위 NP 코칭 시트 URL 참고")
    print(f"\n동기화: python3 scripts/sync_summary.py --only \"{args.name}\"")


if __name__ == "__main__":
    main()
