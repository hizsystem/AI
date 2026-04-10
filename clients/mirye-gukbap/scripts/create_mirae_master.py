#!/usr/bin/env python3
"""미례국밥 마스터시트 자동 생성 (gspread API)"""

import sys
import time
sys.path.insert(0, "/Users/wooseongmin/AI")
from scripts.sheets_auth import get_client

ACCENT = {"red": 0.918, "green": 0.345, "blue": 0.047}  # #EA580C
BLACK = {"red": 0.051, "green": 0.051, "blue": 0.051}
WHITE = {"red": 1, "green": 1, "blue": 1}
BG = {"red": 0.969, "green": 0.965, "blue": 0.949}
GRAY_LIGHT = {"red": 0.953, "green": 0.957, "blue": 0.961}
GREEN_BG = {"red": 0.941, "green": 0.992, "blue": 0.957}
GREEN_FG = {"red": 0.086, "green": 0.639, "blue": 0.247}
ORANGE_BG = {"red": 1, "green": 0.969, "blue": 0.929}
ORANGE_FG = {"red": 0.918, "green": 0.345, "blue": 0.047}
RED_BG = {"red": 0.996, "green": 0.949, "blue": 0.949}
RED_FG = {"red": 0.863, "green": 0.149, "blue": 0.149}
BLUE_BG = {"red": 0.937, "green": 0.965, "blue": 1}
BLUE_FG = {"red": 0.145, "green": 0.388, "blue": 0.922}


def bold_white_on_black():
    return {
        "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": WHITE}},
        "backgroundColor": BLACK,
    }


def create_dashboard(ws):
    """탭 1: 대시보드"""
    ws.update_title("대시보드")

    data = [
        ["미례국밥 x 브랜드라이즈 | 4월", "", "", "", "", ""],
        [""],
        ["MISSION: \"미례국밥\"을 검색하면 볼 게 있는 상태를 만든다.", "", "", "", "", ""],
        [""],
        ["4월 KPI", "", "", "", "", ""],
        ["지표", "현재", "목표", "", "", ""],
        ["체험단 콘텐츠 발행", "0건", "6건+", "", "", ""],
        ["인스타 가이드라인", "미확정", "확정", "", "", ""],
        [""],
        ["이번주 핵심 액션", "", "", "", "", ""],
        ["✅", "액션", "담당", "상태", "", ""],
        ["☐", "킥오프 미팅 (4/7)", "BR+변팀장", "예정", "", ""],
        ["☐", "대표키워드 5개 교체", "BR", "대기", "", ""],
        ["☐", "플레이스 소개문 교체", "BR", "대기", "", ""],
        ["☐", "리뷰노트 체험단 등록", "BR", "대기", "", ""],
        ["☐", "인스타 톤 방향 확정", "BR+변팀장", "대기", "", ""],
        [""],
        ["키워드 순위 TOP 5", "", "", "", "", ""],
        ["키워드", "월 검색", "현재 순위", "변동", "", ""],
        ["센텀 맛집", "14,230", "9위", "42→9 ↑", "", ""],
        ["센텀시티 맛집", "5,550", "9위", "42→9 ↑", "", ""],
        ["부산 센텀 맛집", "4,530", "9위", "NEW", "", ""],
        ["재송동 맛집", "4,460", "3위", "24→3 ↑", "", ""],
        ["센텀국밥", "460", "1위", "2→1 ↑", "", ""],
        [""],
        ["다음 미팅", "", "", "", "", ""],
        ["일시", "안건", "참석", "", "", ""],
        ["4/7(월)", "킥오프: 데이터 진단 + 인스타 방향 + 4월 플랜", "BR + 변팀장", "", "", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")

    ws.merge_cells("A1:F1")
    ws.merge_cells("A3:F3")

    ws.batch_format([
        {"range": "A1:F1", "format": {"textFormat": {"bold": True, "fontSize": 14}, "backgroundColor": BG}},
        {"range": "A3:F3", "format": {
            "textFormat": {"bold": True, "fontSize": 11, "foregroundColorStyle": {"rgbColor": WHITE}},
            "backgroundColor": BLACK, "horizontalAlignment": "CENTER",
        }},
        {"range": "A5", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
        {"range": "A6:C6", "format": {"textFormat": {"bold": True}, "backgroundColor": GRAY_LIGHT}},
        {"range": "C7:C8", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
        {"range": "A10", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
        {"range": "A11:D11", "format": {"textFormat": {"bold": True}, "backgroundColor": GRAY_LIGHT}},
        {"range": "A18", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
        {"range": "A19:D19", "format": {"textFormat": {"bold": True}, "backgroundColor": GRAY_LIGHT}},
        {"range": "D20:D24", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
        {"range": "A26", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
        {"range": "A27:C27", "format": {"textFormat": {"bold": True}, "backgroundColor": GRAY_LIGHT}},
    ])

    ws.set_basic_filter()
    print("  ✓ 대시보드")


def create_tasks(sh):
    """탭 2: 주차별 태스크"""
    ws = sh.add_worksheet(title="주차별 태스크", rows=100, cols=7)

    headers = ["주차", "채널", "태스크", "담당", "상태", "마감일", "비고"]
    data = [
        headers,
        ["W1", "공통", "블랙키위 데이터 분석", "BR", "완료", "4/4", "2,690명/월, 포화도 2.42%"],
        ["W1", "플레이스", "에드로그 히든 키워드 분석", "BR", "완료", "4/4", "센텀 맛집 9위 발견"],
        ["W1", "플레이스", "네이버플레이스 진단", "BR", "진행중", "4/4", ""],
        ["W1", "공통", "KPI 기준선 측정", "BR", "진행중", "4/4", ""],
        ["W1", "공통", "기존 촬영 소스 검토", "BR", "대기", "4/4", "변팀장 공유 대기"],
        [""],
        ["W2", "공통", "킥오프 미팅", "BR+변팀장", "예정", "4/7", ""],
        ["W2", "인스타", "인스타 톤 방향 확정", "BR+변팀장", "대기", "4/11", "브랜딩 vs 가맹"],
        ["W2", "플레이스", "대표키워드 5개 교체", "BR", "대기", "4/8", "돼지우동→센텀맛집"],
        ["W2", "플레이스", "소개문 교체 (센텀)", "BR", "대기", "4/9", "작성 완료, 교체만"],
        ["W2", "플레이스", "소개문 키워드 추가 (센텀맛집/재송동맛집)", "BR", "대기", "4/9", ""],
        ["W2", "체험단", "리뷰노트 캠페인 등록", "BR", "대기", "4/9", "센텀 맛집 키워드 지정"],
        ["W2", "체험단", "키워드 가이드 전달", "변팀장", "대기", "4/11", "1장짜리"],
        ["W2", "메타", "비즈니스 계정 생성", "BR", "대기", "4/11", ""],
        ["W2", "인스타", "인플루언서 후보 확정 (5~7명)", "BR", "대기", "4/11", ""],
        [""],
        ["W3", "인스타", "콘텐츠 가이드라인 확정", "BR", "대기", "4/18", "톤+비율+시리즈"],
        ["W3", "체험단", "첫 체험단 방문 시작", "BR+변팀장", "대기", "4/18", ""],
        ["W3", "인스타", "인플루언서 컨택 DM", "BR", "대기", "4/16", ""],
        ["W3", "플레이스", "소식 발행 시작", "BR", "대기", "4/18", ""],
        ["W3", "플레이스", "리뷰 답변 템플릿 적용", "변팀장", "대기", "4/14", "10종"],
        ["W3", "메타", "광고 세팅 (픽셀, 타겟)", "BR", "대기", "4/18", ""],
        [""],
        ["W4", "인스타", "씨딩 릴스 수거 + QC", "BR", "대기", "4/28", "돼지우동 면뽑기 필수"],
        ["W4", "메타", "광고 시작 (릴스 소재)", "BR", "대기", "4/25", ""],
        ["W4", "체험단", "체험단 콘텐츠 수거 + 키워드 체크", "BR", "대기", "4/28", ""],
        ["W4", "플레이스", "에드로그 순위 변동 체크", "BR", "대기", "4/28", ""],
        ["W4", "공통", "월간 리포트 작성", "BR", "대기", "4/30", ""],
        ["W4", "공통", "Month 2 방향 제안", "BR", "대기", "4/30", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")

    ws.batch_format([
        {"range": "A1:G1", "format": bold_white_on_black()},
    ])

    # 드롭다운
    ws.set_data_validation("E2:E100", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["대기", "진행중", "완료", "보류"]),
        showCustomUi=True
    ))
    ws.set_data_validation("D2:D100", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["BR", "변팀장", "지은", "BR+변팀장"]),
        showCustomUi=True
    ))
    ws.set_data_validation("B2:B100", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["플레이스", "인스타", "체험단", "메타", "공통"]),
        showCustomUi=True
    ))

    # 조건부 서식
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=[gspread.GridRange.from_a1_range("E2:E100", ws)],
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["완료"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*GREEN_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*GREEN_FG.values())))
        )
    ))
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=[gspread.GridRange.from_a1_range("E2:E100", ws)],
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["진행중"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*ORANGE_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*ORANGE_FG.values())))
        )
    ))

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 6)
    print("  ✓ 주차별 태스크")


def create_kpi(sh):
    """탭 3: KPI 트래킹"""
    ws = sh.add_worksheet(title="KPI 트래킹", rows=20, cols=8)

    data = [
        ["지표", "4/1 기준선", "W1 (4/4)", "W2 (4/11)", "W3 (4/18)", "W4 (4/30)", "목표", "달성"],
        ["체험단 콘텐츠 발행", "0건", "", "", "", "", "6건+", ""],
        ["인스타 가이드라인", "미확정", "", "", "", "", "확정", ""],
        ["센텀 맛집 순위", "9위", "", "", "", "", "상승", ""],
        ["재송동 맛집 순위", "3위", "", "", "", "", "유지/상승", ""],
        ["블로그 리뷰 수", "44개", "", "", "", "", "54개+", ""],
        ["방문자 리뷰", "1,296개", "", "", "", "", "", ""],
        ["인플루언서 릴스", "0건", "", "", "", "", "5~7건", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1:H1", "format": bold_white_on_black()},
        {"range": "G2:G8", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
    ])
    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 7)
    print("  ✓ KPI 트래킹")


def create_keywords(sh):
    """탭 4: 키워드 데이터"""
    ws = sh.add_worksheet(title="키워드 데이터", rows=50, cols=7)

    data = [
        ["키워드", "월 검색량", "현재 순위", "2주 전", "변동", "분류", "메모"],
        ["센텀 맛집", "14,230", "9", "42", "↑33", "핵심 기회", "골든타임. 대표키워드 추가"],
        ["센텀시티 맛집", "5,550", "9", "42", "↑33", "핵심 기회", "연동 상승"],
        ["부산 국밥", "5,620", "61", "~100", "↑", "장기 도전", "업체 2,078개"],
        ["부산 센텀 맛집", "4,530", "9", "-", "NEW", "핵심 기회", ""],
        ["재송동 맛집", "4,460", "3", "24", "↑21", "핵심 기회", "지역 전환률 높음"],
        ["센텀국밥", "460", "1", "2", "↑1", "유지", "안착"],
        ["센텀점심", "460", "5", "-", "NEW", "기회", "목적형"],
        ["센텀역맛집", "330", "5", "26", "↑21", "기회", "상승세"],
        ["센텀 돼지국밥", "300", "2", "-", "", "유지", "1위 가능"],
        ["해운대 센텀시티 맛집", "160", "9", "42", "↑33", "기회", "연동"],
        ["부산센텀국밥", "100", "1", "2", "↑1", "유지", ""],
        ["부산센텀순대국", "30", "1", "1", "-", "유지", "1위 고정"],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([
        {"range": "A1:G1", "format": bold_white_on_black()},
    ])

    # 분류별 조건부 서식
    rng = [gspread.GridRange.from_a1_range("F2:F100", ws)]
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=rng,
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["핵심 기회"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*ORANGE_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*ORANGE_FG.values())))
        )
    ))
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=rng,
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["유지"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*GREEN_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*GREEN_FG.values())))
        )
    ))
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=rng,
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["기회"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*BLUE_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*BLUE_FG.values())))
        )
    ))

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 6)
    print("  ✓ 키워드 데이터")


def create_experience(sh):
    """탭 5: 체험단 관리"""
    ws = sh.add_worksheet(title="체험단 관리", rows=100, cols=11)

    headers = ["#", "플랫폼", "블로거명", "블로그 URL", "매장", "방문일", "지정 키워드", "발행일", "키워드 포함", "결과물 URL", "상태"]
    ws.update(values=[headers], range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([{"range": "A1:K1", "format": bold_white_on_black()}])

    ws.set_data_validation("B2:B100", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["리뷰노트", "아싸뷰", "파인앳플", "직접섭외"]),
        showCustomUi=True
    ))
    ws.set_data_validation("E2:E100", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["센텀", "전포"]),
        showCustomUi=True
    ))
    ws.set_data_validation("I2:I100", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["Y", "N"]),
        showCustomUi=True
    ))
    ws.set_data_validation("K2:K100", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["대기", "방문완료", "발행완료", "노쇼"]),
        showCustomUi=True
    ))

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 10)
    print("  ✓ 체험단 관리")


def create_influencer(sh):
    """탭 6: 인플루언서 관리"""
    ws = sh.add_worksheet(title="인플루언서 관리", rows=50, cols=12)

    headers = ["#", "계정명", "채널", "팔로워", "예상 단가", "컨택 상태", "방문일", "콘텐츠 유형", "발행일", "콘텐츠 URL", "2차 활용", "비용"]
    data = [
        headers,
        [1, "@busan.local", "인스타", "~58K", "30~50만", "미컨택", "", "", "", "", "", ""],
        [2, "@busan_zzzzzin_", "인스타", "~10~30K", "15~25만", "미컨택", "", "릴스", "", "", "", ""],
        [3, "@broculri13", "인스타+블로그", "~10~25K", "20~30만", "미컨택", "", "", "", "", "", ""],
        [4, "@muk__jina", "인스타+블로그", "~10~20K", "20~30만", "미컨택", "", "", "", "", "", ""],
        [5, "@busan_date_", "인스타", "~10~20K", "15~25만", "미컨택", "", "", "", "", "", ""],
        [6, "@busan.local.food", "인스타", "~5~15K", "10~20만", "미컨택", "", "", "", "", "", ""],
        [7, "@muk_jeong", "인스타", "~15~30K", "20~30만", "미컨택", "", "", "", "", "", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([{"range": "A1:L1", "format": bold_white_on_black()}])

    ws.set_data_validation("F2:F50", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["미컨택", "DM발송", "수락", "거절", "협의중"]),
        showCustomUi=True
    ))
    ws.set_data_validation("H2:H50", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["릴스", "피드", "블로그", "유튜브"]),
        showCustomUi=True
    ))
    ws.set_data_validation("K2:K50", gspread.DataValidationRule(
        gspread.BooleanCondition("ONE_OF_LIST", ["Y", "N"]),
        showCustomUi=True
    ))

    # 컨택 상태 조건부 서식
    rng = [gspread.GridRange.from_a1_range("F2:F50", ws)]
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=rng,
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["수락"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*GREEN_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*GREEN_FG.values())))
        )
    ))
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=rng,
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["DM발송"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*ORANGE_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*ORANGE_FG.values())))
        )
    ))
    ws.add_conditional_format_rule(gspread.ConditionalFormatRule(
        ranges=rng,
        booleanRule=gspread.BooleanRule(
            condition=gspread.BooleanCondition("TEXT_EQ", ["거절"]),
            format=gspread.CellFormat(backgroundColor=gspread.Color(*RED_BG.values()),
                                       textFormat=gspread.TextFormat(foregroundColor=gspread.Color(*RED_FG.values())))
        )
    ))

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 11)
    print("  ✓ 인플루언서 관리")


def main():
    print("미례국밥 마스터시트 생성 시작...")
    client = get_client()

    sh = client.create("[BR] 미례국밥 — Master Sheet")
    print(f"시트 생성됨: {sh.url}")

    # 탭 생성 (API 호출 간 딜레이)
    create_dashboard(sh.sheet1)
    time.sleep(1)
    create_tasks(sh)
    time.sleep(1)
    create_kpi(sh)
    time.sleep(1)
    create_keywords(sh)
    time.sleep(1)
    create_experience(sh)
    time.sleep(1)
    create_influencer(sh)

    print(f"\n완료! URL: {sh.url}")
    return sh.url


if __name__ == "__main__":
    url = main()
