#!/usr/bin/env python3
"""뉴비즈니스 마스터시트 대시보드 재설계 + 상담신청/진단 탭 추가 스크립트"""

import time
import sys
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

SHEET_ID = "19ZjFR_jbHOniPHpAnZLZYHRISk8oEV7v99lm7ctefVA"
CONSULT_FORM_SHEET_ID = "1juXWYhKjNAhjhJSqranyFIXxDabnJddTMrpsuGk_Ktc"


def redesign_dashboard(sh):
    """gid=0 대시보드 탭 재설계"""
    ws = sh.sheet1
    ws.clear()
    ws.update_title("대시보드")

    # 1차 상담 달성 = 상담신청 내역 탭에서 자동 카운트 (IMPORTRANGE 헤더 1행 제외)
    consult_count = '=COUNTA(\'상담신청 내역\'!A5:A)'

    data = [
        # 섹션 A: 비즈니스 KPI
        ["[A] 비즈니스 KPI", "", "", "", ""],
        ["3월 KPI", "목표", "달성", "달성률", "달성액"],
        ["1차 상담", 100, consult_count, '=IF(B3=0,0,C3/B3)', ""],
        ["2차 수주(매출화)", 30, "", '=IF(B4=0,0,C4/B4)', ""],
        ["", "", "", "", ""],

        # 섹션 B: Meta 광고 성과
        ["[B] Meta 광고 성과", "", "", "", ""],
        ["지표", "이번 주", "지난 주", "변화", "누적"],
        ["광고비", "", "", '=IF(C8=0,"",B8-C8)', '=SUM(\'Meta Ads\'!F:F)'],
        ["클릭", "", "", '=IF(C9=0,"",B9-C9)', '=SUM(\'Meta Ads\'!H:H)'],
        ["평균 CPC", "", "", '=IF(C10=0,"",B10-C10)', '=IF(E9=0,0,E8/E9)'],
        ["노출", "", "", '=IF(C11=0,"",B11-C11)', '=SUM(\'Meta Ads\'!K:K)'],
        ["도달", "", "", '=IF(C12=0,"",B12-C12)', '=SUM(\'Meta Ads\'!L:L)'],
        ["CTR", "", "", '=IF(C13=0,"",B13-C13)', '=IF(E11=0,0,E9/E11)'],
        ["상담 전환", "", "", '=IF(C14=0,"",B14-C14)', '=COUNTIF(\'상담신청 내역\'!B5:B,"*광고*")'],
        ["CPA (상담 단가)", "", "", '=IF(C15=0,"",B15-C15)', '=IF(E14=0,0,E8/E14)'],
        ["", "", "", "", ""],

        # 섹션 C: 오가닉 콘텐츠 성과
        ["[C] 오가닉 콘텐츠 성과", "", "", "", ""],
        ["지표", "이번 주", "지난 주", "변화", "누적"],
        [
            "발행 수", "", "", '=IF(C19=0,"",B19-C19)',
            '=COUNTA(\'Content Tracker\'!A:A)-1'
        ],
        [
            "총 도달", "", "", '=IF(C20=0,"",B20-C20)',
            '=SUM(\'Content Tracker\'!G:G)'
        ],
        [
            "총 참여 (좋아요+댓글+저장+공유)", "", "", '=IF(C21=0,"",B21-C21)',
            '=SUM(\'Content Tracker\'!H:H)+SUM(\'Content Tracker\'!I:I)+SUM(\'Content Tracker\'!J:J)+SUM(\'Content Tracker\'!K:K)'
        ],
        [
            "참여율", "", "", '=IF(C22=0,"",B22-C22)',
            '=IF(E20=0,0,E21/E20)'
        ],
        [
            "프로필 방문", "", "", '=IF(C23=0,"",B23-C23)',
            '=SUM(\'Content Tracker\'!M:M)'
        ],
        [
            "외부 링크 클릭", "", "", '=IF(C24=0,"",B24-C24)',
            '=SUM(\'Content Tracker\'!N:N)'
        ],
        [
            "팔로우 전환", "", "", '=IF(C25=0,"",B25-C25)',
            '=SUM(\'Content Tracker\'!O:O)'
        ],
        ["", "", "", "", ""],

        # 섹션 D: 퍼널 전환 현황
        ["[D] 퍼널 전환 현황", "", "", "", ""],
        ["단계", "수치", "전환율", "", ""],
        ["광고 노출", '=E11', "", "", ""],
        ["클릭", '=E9', '=IF(B29=0,0,B30/B29)', "", ""],
        ["상담 신청", '=C3', '=IF(B30=0,0,B31/B30)', "", ""],
        ["수주", '=C4', '=IF(B31=0,0,B32/B31)', "", ""],
        ["", "", "", "", ""],

        # 섹션 E: TOP 콘텐츠 (외부 링크 클릭 기준)
        ["[E] 이번 주 TOP 콘텐츠 (외부 링크 클릭 기준)", "", "", "", ""],
        ["순위", "제목", "도달", "외부 링크 클릭", "광고 여부"],
        [
            1,
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),2,1),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),2,4),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),2,11),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:P,13,FALSE),2,13),"")',
        ],
        [
            2,
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),3,1),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),3,4),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),3,11),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:P,13,FALSE),3,13),"")',
        ],
        [
            3,
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),4,1),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),4,4),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:N,11,FALSE),4,11),"")',
            '=IFERROR(INDEX(SORT(\'Content Tracker\'!D:P,13,FALSE),4,13),"")',
        ],
    ]

    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")

    # 숫자 포맷 정의
    fmt_comma = {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}
    fmt_pct = {"numberFormat": {"type": "PERCENT", "pattern": "0.0%"}}
    fmt_won = {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}

    # 포맷팅
    format_rules = [
        # 섹션 헤더 스타일
        {"range": "A1:E1", "format": {
            "textFormat": {"bold": True, "fontSize": 12, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.15, "green": 0.3, "blue": 0.6},
        }},
        {"range": "A6:E6", "format": {
            "textFormat": {"bold": True, "fontSize": 12, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.2, "green": 0.5, "blue": 0.8},
        }},
        {"range": "A17:E17", "format": {
            "textFormat": {"bold": True, "fontSize": 12, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.2, "green": 0.6, "blue": 0.3},
        }},
        {"range": "A27:E27", "format": {
            "textFormat": {"bold": True, "fontSize": 12, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.6, "green": 0.3, "blue": 0.2},
        }},
        {"range": "A34:E34", "format": {
            "textFormat": {"bold": True, "fontSize": 12, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
            "backgroundColor": {"red": 0.5, "green": 0.3, "blue": 0.6},
        }},
        # 서브 헤더 스타일
        {"range": "A2:E2", "format": {"textFormat": {"bold": True}, "backgroundColor": {"red": 0.9, "green": 0.9, "blue": 0.95}}},
        {"range": "A7:E7", "format": {"textFormat": {"bold": True}, "backgroundColor": {"red": 0.9, "green": 0.9, "blue": 0.95}}},
        {"range": "A18:E18", "format": {"textFormat": {"bold": True}, "backgroundColor": {"red": 0.9, "green": 0.9, "blue": 0.95}}},
        {"range": "A28:E28", "format": {"textFormat": {"bold": True}, "backgroundColor": {"red": 0.9, "green": 0.9, "blue": 0.95}}},
        {"range": "A35:E35", "format": {"textFormat": {"bold": True}, "backgroundColor": {"red": 0.9, "green": 0.9, "blue": 0.95}}},

        # --- 숫자 포맷: 콤마 (1,000 단위) ---
        # 섹션 A: 달성 수치
        {"range": "B3:C4", "format": fmt_comma},
        {"range": "E3:E4", "format": fmt_won},
        # 섹션 A: 달성률 → 백분율
        {"range": "D3:D4", "format": fmt_pct},

        # 섹션 B: 광고비, CPC, CPA → 콤마
        {"range": "B8:E8", "format": fmt_won},      # 광고비
        {"range": "B9:E9", "format": fmt_comma},     # 클릭
        {"range": "B10:E10", "format": fmt_won},     # CPC
        {"range": "B11:E11", "format": fmt_comma},   # 노출
        {"range": "B12:E12", "format": fmt_comma},   # 도달
        {"range": "B13:E13", "format": fmt_pct},     # CTR → 백분율
        {"range": "B14:E14", "format": fmt_comma},   # 상담 전환
        {"range": "B15:E15", "format": fmt_won},     # CPA

        # 섹션 C: 오가닉 수치 → 콤마
        {"range": "B19:E19", "format": fmt_comma},   # 발행 수
        {"range": "B20:E20", "format": fmt_comma},   # 도달
        {"range": "B21:E21", "format": fmt_comma},   # 참여
        {"range": "B22:E22", "format": fmt_pct},     # 참여율 → 백분율
        {"range": "B23:E23", "format": fmt_comma},   # 프로필 방문
        {"range": "B24:E24", "format": fmt_comma},   # 외부 링크
        {"range": "B25:E25", "format": fmt_comma},   # 팔로우

        # 섹션 D: 퍼널 수치 → 콤마, 전환율 → 백분율
        {"range": "B29:B32", "format": fmt_comma},
        {"range": "C30:C32", "format": fmt_pct},

        # 섹션 E: TOP 콘텐츠 수치 → 콤마
        {"range": "C36:D38", "format": fmt_comma},
    ]
    ws.batch_format(format_rules)
    print("Dashboard redesigned successfully.")


def add_consultation_tab(sh):
    """상담신청 내역 탭 추가/재설정 (IMPORTRANGE 연동)"""
    existing = [ws.title for ws in sh.worksheets()]
    if "상담신청 내역" in existing:
        ws = sh.worksheet("상담신청 내역")
        ws.clear()
        print("'상담신청 내역' tab cleared for re-setup.")
    else:
        ws = sh.add_worksheet(title="상담신청 내역", rows=500, cols=20)

    # IMPORTRANGE로 구글폼 응답 시트 연동
    data = [
        ["[구글폼 상담신청 자동 연동]", "", "", "", ""],
        ["※ 아래 IMPORTRANGE 수식이 #REF! 에러를 보이면, 셀을 클릭 후 '접근 허용'을 눌러주세요.", "", "", "", ""],
        [],
    ]
    ws.update(values=data, range_name="A1")

    # IMPORTRANGE 수식 삽입 (행 4부터)
    import_formula = f'=IMPORTRANGE("https://docs.google.com/spreadsheets/d/{CONSULT_FORM_SHEET_ID}", "설문지 응답 시트1!A:Z")'
    ws.update(values=[[import_formula]], range_name="A4", value_input_option="USER_ENTERED")

    ws.batch_format([
        {"range": "A1:E1", "format": {
            "textFormat": {"bold": True, "fontSize": 11},
            "backgroundColor": {"red": 0.95, "green": 0.9, "blue": 0.8},
        }},
        {"range": "A2:E2", "format": {
            "textFormat": {"italic": True, "foregroundColorStyle": {"rgbColor": {"red": 0.7, "green": 0.2, "blue": 0.2}}},
        }},
    ])
    print("'상담신청 내역' tab set up with IMPORTRANGE.")


def add_diagnosis_tab(sh):
    """마케팅 진단 내역 탭 추가 (수동 입력용)"""
    existing = [ws.title for ws in sh.worksheets()]
    if "마케팅 진단 내역" in existing:
        print("'마케팅 진단 내역' tab already exists. Skipping.")
        return

    ws = sh.add_worksheet(title="마케팅 진단 내역", rows=500, cols=10)

    data = [
        ["[마케팅 진단 설문 내역 - 수동 입력]", "", "", "", "", "", "", ""],
        ["※ brandrise.co.kr/admin/surveys에서 CSV 내보내기 후 여기에 붙여넣기", "", "", "", "", "", "", ""],
        [],
        ["날짜", "응답자", "업종", "기업규모", "매출규모", "주요 마케팅 고민", "현재 마케팅 상태", "비고"],
    ]
    ws.update(values=data, range_name="A1")

    ws.batch_format([
        {"range": "A1:H1", "format": {
            "textFormat": {"bold": True, "fontSize": 11},
            "backgroundColor": {"red": 0.85, "green": 0.92, "blue": 0.85},
        }},
        {"range": "A2:H2", "format": {
            "textFormat": {"italic": True, "foregroundColorStyle": {"rgbColor": {"red": 0.3, "green": 0.5, "blue": 0.3}}},
        }},
        {"range": "A4:H4", "format": {
            "textFormat": {"bold": True},
            "backgroundColor": {"red": 0.9, "green": 0.95, "blue": 0.9},
        }},
    ])
    print("'마케팅 진단 내역' tab created (manual input).")


def main():
    client = get_client()
    sh = client.open_by_key(SHEET_ID)
    print(f"Opened: {sh.title}")
    print(f"URL: {sh.url}")

    # 1. 대시보드 재설계
    redesign_dashboard(sh)
    time.sleep(2)

    # 2. 상담신청 내역 탭 추가
    add_consultation_tab(sh)
    time.sleep(2)

    # 3. 마케팅 진단 내역 탭 추가
    add_diagnosis_tab(sh)

    print("\nAll done! Check the spreadsheet.")


if __name__ == "__main__":
    main()
