#!/usr/bin/env python3
"""GoVenture Forum 월간 운영 마스터시트 생성/관리 스크립트

사용법:
  # 마스터시트 신규 생성
  python scripts/create_forum_mastersheet.py --create

  # 새 회차 탭 추가 (예: 190회, 4월)
  python scripts/create_forum_mastersheet.py --add-event 190 --month 4 --date 2026-04-28

  # 공유
  python scripts/create_forum_mastersheet.py --share user@example.com
"""

import argparse
import time
import sys
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client


# ── 컬러 팔레트 ──────────────────────────────────────────
WHITE = {"red": 1, "green": 1, "blue": 1}
DARK_BLUE = {"red": 0.1, "green": 0.15, "blue": 0.25}
BRAND_RED = {"red": 0.8, "green": 0.2, "blue": 0.15}
BRAND_DARK = {"red": 0.15, "green": 0.15, "blue": 0.2}
LIGHT_GRAY = {"red": 0.95, "green": 0.95, "blue": 0.95}
GREEN = {"red": 0.15, "green": 0.5, "blue": 0.3}
AMBER = {"red": 0.85, "green": 0.55, "blue": 0.1}

HEADER_FMT = {
    "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": WHITE}},
    "backgroundColor": DARK_BLUE,
}
SECTION_FMT = {
    "textFormat": {"bold": True, "fontSize": 11},
}


def create_dashboard_tab(ws):
    """탭 1: 대시보드 — 전체 현황 한눈에"""
    ws.update_title("대시보드")
    data = [
        ["GoVenture Forum 대시보드", "", "", "", ""],
        ["", "", "", "", ""],
        ["[최근 행사]", "", "", "", ""],
        ["회차", "일자", "주제", "연사", "참석자"],
        # 데이터는 회차 탭 추가 시 수동 업데이트 또는 수식 연결
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["[누적 통계]", "", "", "", ""],
        ["총 행사 횟수", "=COUNTA(A5:A10)", "", "", ""],
        ["총 참석자 수 (연인원)", "=SUM(E5:E10)", "", "", ""],
        ["평균 참석자 수", "=IF(B13=0,0,B14/B13)", "", "", ""],
        ["누적 신규 참석자", "=COUNTA('참석자 통합 DB'!A3:A)", "", "", ""],
        ["재참석률", "", "", "수동 업데이트", ""],
        ["", "", "", "", ""],
        ["[다음 행사]", "", "", "", ""],
        ["회차", "", "", "", ""],
        ["일자", "", "", "", ""],
        ["주제", "", "", "", ""],
        ["연사", "", "", "", ""],
        ["이달의 브랜드", "", "", "", ""],
        ["모집 현황", "", "/", "목표", ""],
        ["D-day", "", "", "", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1", "format": {"textFormat": {"bold": True, "fontSize": 14}}},
        {"range": "A3", "format": SECTION_FMT},
        {"range": "A4:E4", "format": HEADER_FMT},
        {"range": "A12", "format": SECTION_FMT},
        {"range": "A19", "format": SECTION_FMT},
    ])


def create_participant_db_tab(sh):
    """탭 2: 참석자 통합 DB — 전 회차 누적"""
    ws = sh.add_worksheet(title="참석자 통합 DB", rows=500, cols=14)
    header = [
        "이름", "소속", "직함", "연락처", "이메일",
        "유형", "첫 참석 회차", "총 참석 횟수",
        "참석 회차 목록", "뉴스레터 구독", "상담 이력",
        "태그", "최근 참석일", "비고",
    ]
    guide = [
        "", "", "", "010-0000-0000", "email@example.com",
        "창업자/투자자/전문직/기관/내부", "188", "",
        "188,189,190", "O/X", "날짜+내용",
        "VIP/재참석/연사후보", "2026-03-31", "",
    ]
    ws.update(values=[header, guide], range_name="A1")
    ws.batch_format([
        {"range": "A1:N1", "format": HEADER_FMT},
        {"range": "A2:N2", "format": {
            "textFormat": {"italic": True, "foregroundColorStyle": {"rgbColor": {"red": 0.5, "green": 0.5, "blue": 0.5}}},
        }},
    ])
    return ws


def create_event_history_tab(sh):
    """탭 3: 연사/브랜드 히스토리"""
    ws = sh.add_worksheet(title="연사-브랜드 히스토리", rows=50, cols=10)
    header = [
        "회차", "일자", "주제 타이틀", "키노트 연사", "연사 소속",
        "이달의 브랜드", "브랜드 발표자", "참석자 수", "만족도 평균", "비고",
    ]
    ws.update(values=[header], range_name="A1")
    ws.batch_format([
        {"range": "A1:J1", "format": HEADER_FMT},
    ])
    return ws


def create_event_tab(sh, event_num, month, date_str):
    """회차별 탭 — 신청자 관리 + 체크리스트"""
    title = f"{event_num}회 ({month}월)"
    ws = sh.add_worksheet(title=title, rows=200, cols=18)

    data = [
        [f"제{event_num}회 GoVenture Forum", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        [f"일시: {date_str}", "", "장소: 탭샵바 합정점", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
        # 신청자 헤더
        [
            "#", "이름", "소속", "직함", "연락처", "이메일",
            "유형", "신청채널", "신청일", "결제상태",
            "참석확인", "실참석", "음료선택", "1:1상담",
            "만족도", "비고",
        ],
        # 가이드 행
        [
            "", "", "", "", "", "",
            "창업자/투자자/전문직/기관", "온오프믹스/이벤터스/직접/VIP", "", "완료/미결제/무료",
            "O/X/미응답", "O/X", "커피/와인", "희망/예약/미희망",
            "1~5", "",
        ],
    ]

    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1", "format": {"textFormat": {"bold": True, "fontSize": 13}}},
        {"range": "A2", "format": {"textFormat": {"foregroundColorStyle": {"rgbColor": {"red": 0.5, "green": 0.5, "blue": 0.5}}}}},
        {"range": "A4:P4", "format": HEADER_FMT},
        {"range": "A5:P5", "format": {
            "textFormat": {"italic": True, "fontSize": 9, "foregroundColorStyle": {"rgbColor": {"red": 0.5, "green": 0.5, "blue": 0.5}}},
        }},
    ])

    # 요약 영역 (우측에 배치)
    summary = [
        ["[모집 현황]"],
        ["총 신청", f"=COUNTA(B6:B200)"],
        ["결제 완료", f"=COUNTIF(J6:J200,\"완료\")"],
        ["미결제", f"=COUNTIF(J6:J200,\"미결제\")"],
        ["무료 초청", f"=COUNTIF(J6:J200,\"무료\")"],
        ["참석 확인", f"=COUNTIF(K6:K200,\"O\")"],
        ["실참석", f"=COUNTIF(L6:L200,\"O\")"],
        ["노쇼율", f"=IF(R8=0,0,1-R13/R8)"],
        [""],
        ["[유형별]"],
        ["창업자", f"=COUNTIF(G6:G200,\"창업자\")"],
        ["투자자", f"=COUNTIF(G6:G200,\"투자자\")"],
        ["전문직", f"=COUNTIF(G6:G200,\"전문직\")"],
        ["기관", f"=COUNTIF(G6:G200,\"기관\")"],
        [""],
        ["[채널별]"],
        ["온오프믹스", f"=COUNTIF(H6:H200,\"온오프믹스\")"],
        ["이벤터스", f"=COUNTIF(H6:H200,\"이벤터스\")"],
        ["직접", f"=COUNTIF(H6:H200,\"직접\")"],
        ["VIP", f"=COUNTIF(H6:H200,\"VIP\")"],
        [""],
        ["[음료]"],
        ["커피", f"=COUNTIF(M6:M200,\"커피\")"],
        ["와인", f"=COUNTIF(M6:M200,\"와인\")"],
        [""],
        ["[만족도]"],
        ["평균", f"=IFERROR(AVERAGE(O6:O200),\"-\")"],
        ["응답 수", f"=COUNT(O6:O200)"],
    ]
    ws.update(values=summary, range_name="R1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "R1", "format": SECTION_FMT},
        {"range": "R10", "format": SECTION_FMT},
        {"range": "R16", "format": SECTION_FMT},
        {"range": "R22", "format": SECTION_FMT},
        {"range": "R26", "format": SECTION_FMT},
    ])

    return ws


def create_checklist_template_tab(sh):
    """탭: 운영 체크리스트 템플릿 — 매월 복제용"""
    ws = sh.add_worksheet(title="체크리스트 템플릿", rows=80, cols=6)
    data = [
        ["GoVenture Forum 월간 체크리스트", "", "", "", "", ""],
        ["회차:", "", "일자:", "", "주제:", ""],
        ["", "", "", "", "", ""],
        ["시점", "카테고리", "항목", "담당", "상태", "비고"],
        # D-28
        ["D-28", "기획", "주제 확정 (부회장님 승인)", "우성민", "", ""],
        ["D-28", "기획", "키노트 내용 권윤정 대표 협의", "우성민", "", ""],
        ["D-28", "기획", "이달의 브랜드 섭외", "권윤정", "", ""],
        ["D-28", "보고", "부회장님 기획 보고", "우성민", "", "카톡"],
        # D-21
        ["D-21", "디자인", "키비주얼 포스터 제작", "디자이너", "", "마스터 1장"],
        ["D-21", "디자인", "사이즈 변환 (온오프믹스/인스타/뉴스레터)", "디자이너", "", ""],
        ["D-21", "플랫폼", "온오프믹스 등록", "우성민", "", ""],
        ["D-21", "플랫폼", "이벤터스 등록", "우성민", "", ""],
        ["D-21", "플랫폼", "Festa 등록", "우성민", "", ""],
        ["D-21", "플랫폼", "공식 홈페이지 업데이트", "우성민", "", ""],
        ["D-21", "뉴스레터", "전월 랩업 + 이번 회차 안내 뉴스레터 발송", "우성민", "", "스티비"],
        ["D-21", "보고", "부회장님 중간 보고 (모집 시작)", "우성민", "", "카톡"],
        # D-14
        ["D-14", "홍보", "인스타 콘텐츠 업로드 + Meta 광고 시작", "우성민", "", ""],
        ["D-14", "홍보", "외부 뉴스레터 제보 (스타트업위클리, DEMODAY 등)", "우성민", "", "무료 우선"],
        ["D-14", "홍보", "SNS/커뮤니티 홍보 (FB, LinkedIn, 카톡)", "우성민", "", ""],
        ["D-14", "홍보", "핵심 인물 DM 초청", "우성민", "", ""],
        ["D-14", "체크", "모집 현황 점검 (목표 대비 달성률)", "우성민", "", ""],
        # D-7
        ["D-7", "보고", "부회장님 최종 보고", "우성민", "", "카톡"],
        ["D-7", "디자인", "명찰 디자인 확정 + 인쇄 발주", "디자이너", "", "유형별 색상"],
        ["D-7", "운영", "현장 물품 준비 (사이니지, 포스터 인쇄)", "우성민", "", ""],
        ["D-7", "콘텐츠", "연사 발표자료 수합", "우성민", "", "권윤정 대표"],
        ["D-7", "홍보", "리마인더 뉴스레터/메시지 발송", "우성민", "", ""],
        ["D-7", "체크", "모집 부족 시 추가 홍보/무료 티켓", "우성민", "", ""],
        # D-2
        ["D-2", "운영", "전원 참석 확인 연락 (문자/카톡)", "우성민", "", ""],
        ["D-2", "운영", "커피/와인 선택 취합", "우성민", "", ""],
        ["D-2", "운영", "미결제자 현장 결제 안내", "우성민", "", ""],
        ["D-2", "운영", "탭샵바 최종 인원/음식 공유", "우성민", "", ""],
        ["D-2", "운영", "장비 사전 체크 (마이크/프로젝터)", "우성민", "", ""],
        # D-day
        ["D-day", "운영", "리셉션 (접수/명찰/쿠폰)", "우성민", "", ""],
        ["D-day", "운영", "프로그램 진행", "윤태현(MC)", "", ""],
        ["D-day", "운영", "현장 촬영 (사진/영상)", "촬영", "", ""],
        ["D-day", "운영", "참석자 체크인 기록", "우성민", "", ""],
        # D+3
        ["D+3", "보고", "부회장님 결과 보고", "우성민", "", "카톡 + 사진"],
        ["D+3", "후속", "감사 메시지 발송 (만족도 조사 + 진단 CTA)", "우성민", "", ""],
        ["D+3", "후속", "행사 사진 정리 → 드라이브 업로드", "우성민", "", ""],
        ["D+3", "후속", "참석자 DB 통합 (마스터시트)", "우성민", "", ""],
        ["D+3", "후속", "다음 달 주제 논의 시작", "우성민", "", "부회장님 방향"],
    ]
    ws.update(values=data, range_name="A1")
    ws.batch_format([
        {"range": "A1", "format": {"textFormat": {"bold": True, "fontSize": 13}}},
        {"range": "A4:F4", "format": HEADER_FMT},
    ])
    return ws


def create_forum_mastersheet(share_emails=None):
    """고벤처포럼 마스터시트 전체 생성"""
    client = get_client()
    title = "[GoVenture Forum] 마스터시트"

    sh = client.create(title)
    print(f"Created: {title}")
    print(f"URL: {sh.url}")

    # 탭 1: 대시보드
    create_dashboard_tab(sh.sheet1)
    print("  + 대시보드")
    time.sleep(2)

    # 탭 2: 참석자 통합 DB
    create_participant_db_tab(sh)
    print("  + 참석자 통합 DB")
    time.sleep(2)

    # 탭 3: 연사/브랜드 히스토리
    create_event_history_tab(sh)
    print("  + 연사-브랜드 히스토리")
    time.sleep(2)

    # 탭 4: 체크리스트 템플릿
    create_checklist_template_tab(sh)
    print("  + 체크리스트 템플릿")
    time.sleep(2)

    # 공유
    if share_emails:
        for email in share_emails:
            sh.share(email.strip(), perm_type="user", role="writer")
            print(f"  Shared with: {email.strip()}")

    print(f"\nDone! Open: {sh.url}")
    return sh


def add_event_tab(sheet_url, event_num, month, date_str, share_emails=None):
    """기존 마스터시트에 새 회차 탭 추가"""
    client = get_client()
    sh = client.open_by_url(sheet_url)

    ws = create_event_tab(sh, event_num, month, date_str)
    print(f"Added tab: {ws.title}")
    print(f"Sheet: {sh.url}")
    return ws


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GoVenture Forum 마스터시트")
    parser.add_argument("--create", action="store_true", help="마스터시트 신규 생성")
    parser.add_argument("--add-event", type=int, help="새 회차 탭 추가 (회차 번호)")
    parser.add_argument("--month", type=int, help="행사 월")
    parser.add_argument("--date", help="행사 일자 (YYYY-MM-DD)")
    parser.add_argument("--sheet-url", help="기존 마스터시트 URL (--add-event 시 필요)")
    parser.add_argument("--share", help="공유 이메일 (쉼표 구분)")
    args = parser.parse_args()

    emails = args.share.split(",") if args.share else None

    if args.create:
        create_forum_mastersheet(emails)
    elif args.add_event:
        if not all([args.month, args.date, args.sheet_url]):
            print("Error: --add-event requires --month, --date, --sheet-url")
            sys.exit(1)
        add_event_tab(args.sheet_url, args.add_event, args.month, args.date)
    else:
        parser.print_help()
