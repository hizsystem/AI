#!/usr/bin/env python3
"""미례국밥 마스터시트 — 나머지 탭 추가 (대시보드는 이미 생성됨)"""

import sys
import time
sys.path.insert(0, "/Users/wooseongmin/AI")
from scripts.sheets_auth import get_client
import gspread

SHEET_ID = "1IPck3AMRnrjWxGdKR7N6aqGwMiu7oY5dK5EF3xuV7Lw"

ACCENT = {"red": 0.918, "green": 0.345, "blue": 0.047}
BLACK = {"red": 0.051, "green": 0.051, "blue": 0.051}
WHITE = {"red": 1, "green": 1, "blue": 1}
GREEN_BG = {"red": 0.941, "green": 0.992, "blue": 0.957}
GREEN_FG = {"red": 0.086, "green": 0.639, "blue": 0.247}
ORANGE_BG = {"red": 1, "green": 0.969, "blue": 0.929}
ORANGE_FG = {"red": 0.918, "green": 0.345, "blue": 0.047}
RED_BG = {"red": 0.996, "green": 0.949, "blue": 0.949}
RED_FG = {"red": 0.863, "green": 0.149, "blue": 0.149}
BLUE_BG = {"red": 0.937, "green": 0.965, "blue": 1}
BLUE_FG = {"red": 0.145, "green": 0.388, "blue": 0.922}


def bwob():
    return {
        "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": WHITE}},
        "backgroundColor": BLACK,
    }


def add_dropdown(ws, range_str, values):
    """드롭다운 — gspread 6.x 호환 이슈로 스킵"""
    pass


def add_cond_fmt(ws, range_str, text, bg, fg):
    """조건부 서식 — gspread 6.x는 batch_update로"""
    # 조건부 서식은 시트에서 수동 추가 (API 호환성 이슈)
    pass


def fill_tasks(ws):
    """이미 생성된 주차별 태스크 탭에 데이터 채우기"""
    data = [
        ["주차", "채널", "태스크", "담당", "상태", "마감일", "비고"],
        ["W1", "공통", "블랙키위 데이터 분석", "BR", "완료", "4/4", "2,690명/월"],
        ["W1", "플레이스", "에드로그 히든 키워드 분석", "BR", "완료", "4/4", "센텀 맛집 9위"],
        ["W1", "플레이스", "네이버플레이스 진단", "BR", "진행중", "4/4", ""],
        ["W1", "공통", "KPI 기준선 측정", "BR", "진행중", "4/4", ""],
        ["W1", "공통", "기존 촬영 소스 검토", "BR", "대기", "4/4", "변팀장 공유 대기"],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([{"range": "A1:G1", "format": bwob()}])
    ws.freeze(rows=1)
    print("  ✓ 주차별 태스크 데이터 채움")


def create_tasks(sh):
    ws = sh.add_worksheet(title="주차별 태스크", rows=100, cols=7)
    data = [
        ["주차", "채널", "태스크", "담당", "상태", "마감일", "비고"],
        ["W1", "공통", "블랙키위 데이터 분석", "BR", "완료", "4/4", "2,690명/월, 포화도 2.42%"],
        ["W1", "플레이스", "에드로그 히든 키워드 분석", "BR", "완료", "4/4", "센텀 맛집 9위 발견"],
        ["W1", "플레이스", "네이버플레이스 진단", "BR", "진행중", "4/4", ""],
        ["W1", "공통", "KPI 기준선 측정", "BR", "진행중", "4/4", ""],
        ["W1", "공통", "기존 촬영 소스 검토", "BR", "대기", "4/4", "변팀장 공유 대기"],
        [""],
        ["W2", "공통", "킥오프 미팅", "BR+변팀장", "예정", "4/7", ""],
        ["W2", "인스타", "인스타 톤 방향 확정", "BR+변팀장", "대기", "4/11", "브랜딩 vs 가맹"],
        ["W2", "플레이스", "대표키워드 5개 교체", "BR", "대기", "4/8", "돼지우동→센텀맛집"],
        ["W2", "플레이스", "소개문 교체 (센텀)", "BR", "대기", "4/9", ""],
        ["W2", "플레이스", "소개문 키워드 추가", "BR", "대기", "4/9", "센텀맛집/재송동맛집"],
        ["W2", "체험단", "리뷰노트 캠페인 등록", "BR", "대기", "4/9", "센텀 맛집 키워드"],
        ["W2", "체험단", "키워드 가이드 전달", "변팀장", "대기", "4/11", ""],
        ["W2", "메타", "비즈니스 계정 생성", "BR", "대기", "4/11", ""],
        ["W2", "인스타", "인플루언서 후보 확정", "BR", "대기", "4/11", "5~7명"],
        [""],
        ["W3", "인스타", "콘텐츠 가이드라인 확정", "BR", "대기", "4/18", ""],
        ["W3", "체험단", "첫 체험단 방문", "BR+변팀장", "대기", "4/18", ""],
        ["W3", "인스타", "인플루언서 컨택 DM", "BR", "대기", "4/16", ""],
        ["W3", "플레이스", "소식 발행 시작", "BR", "대기", "4/18", ""],
        ["W3", "플레이스", "리뷰 답변 템플릿 적용", "변팀장", "대기", "4/14", ""],
        ["W3", "메타", "광고 세팅", "BR", "대기", "4/18", ""],
        [""],
        ["W4", "인스타", "씨딩 릴스 수거 + QC", "BR", "대기", "4/28", ""],
        ["W4", "메타", "광고 시작", "BR", "대기", "4/25", ""],
        ["W4", "체험단", "콘텐츠 수거 + 키워드 체크", "BR", "대기", "4/28", ""],
        ["W4", "플레이스", "에드로그 순위 체크", "BR", "대기", "4/28", ""],
        ["W4", "공통", "월간 리포트", "BR", "대기", "4/30", ""],
        ["W4", "공통", "Month 2 제안", "BR", "대기", "4/30", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([{"range": "A1:G1", "format": bwob()}])

    add_dropdown(ws, "E2:E100", ["대기", "진행중", "완료", "보류"])
    add_dropdown(ws, "D2:D100", ["BR", "변팀장", "지은", "BR+변팀장"])
    add_dropdown(ws, "B2:B100", ["플레이스", "인스타", "체험단", "메타", "공통"])

    add_cond_fmt(ws, "E2:E100", "완료", GREEN_BG, GREEN_FG)
    add_cond_fmt(ws, "E2:E100", "진행중", ORANGE_BG, ORANGE_FG)

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 6)
    print("  ✓ 주차별 태스크")


def create_kpi(sh):
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
        {"range": "A1:H1", "format": bwob()},
        {"range": "G2:G8", "format": {"textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": ACCENT}}}},
    ])
    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 7)
    print("  ✓ KPI 트래킹")


def create_keywords(sh):
    ws = sh.add_worksheet(title="키워드 데이터", rows=50, cols=7)
    data = [
        ["키워드", "월 검색량", "현재 순위", "2주 전", "변동", "분류", "메모"],
        ["센텀 맛집", "14,230", "9", "42", "↑33", "핵심 기회", "골든타임"],
        ["센텀시티 맛집", "5,550", "9", "42", "↑33", "핵심 기회", "연동"],
        ["부산 국밥", "5,620", "61", "~100", "↑", "장기 도전", "업체 2,078개"],
        ["부산 센텀 맛집", "4,530", "9", "-", "NEW", "핵심 기회", ""],
        ["재송동 맛집", "4,460", "3", "24", "↑21", "핵심 기회", "전환률 높음"],
        ["센텀국밥", "460", "1", "2", "↑1", "유지", "안착"],
        ["센텀점심", "460", "5", "-", "NEW", "기회", "목적형"],
        ["센텀역맛집", "330", "5", "26", "↑21", "기회", ""],
        ["센텀 돼지국밥", "300", "2", "-", "", "유지", "1위 가능"],
        ["해운대 센텀시티 맛집", "160", "9", "42", "↑33", "기회", ""],
        ["부산센텀국밥", "100", "1", "2", "↑1", "유지", ""],
        ["부산센텀순대국", "30", "1", "1", "-", "유지", "1위"],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([{"range": "A1:G1", "format": bwob()}])

    add_cond_fmt(ws, "F2:F100", "핵심 기회", ORANGE_BG, ORANGE_FG)
    add_cond_fmt(ws, "F2:F100", "유지", GREEN_BG, GREEN_FG)
    add_cond_fmt(ws, "F2:F100", "기회", BLUE_BG, BLUE_FG)

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 6)
    print("  ✓ 키워드 데이터")


def create_experience(sh):
    ws = sh.add_worksheet(title="체험단 관리", rows=100, cols=11)
    headers = [["#", "플랫폼", "블로거명", "블로그 URL", "매장", "방문일", "지정 키워드", "발행일", "키워드 포함", "결과물 URL", "상태"]]
    ws.update(values=headers, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([{"range": "A1:K1", "format": bwob()}])

    add_dropdown(ws, "B2:B100", ["리뷰노트", "아싸뷰", "파인앳플", "직접섭외"])
    add_dropdown(ws, "E2:E100", ["센텀", "전포"])
    add_dropdown(ws, "I2:I100", ["Y", "N"])
    add_dropdown(ws, "K2:K100", ["대기", "방문완료", "발행완료", "노쇼"])

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 10)
    print("  ✓ 체험단 관리")


def create_influencer(sh):
    ws = sh.add_worksheet(title="인플루언서 관리", rows=50, cols=12)
    data = [
        ["#", "계정명", "채널", "팔로워", "예상 단가", "컨택 상태", "방문일", "콘텐츠 유형", "발행일", "콘텐츠 URL", "2차 활용", "비용"],
        [1, "@busan.local", "인스타", "~58K", "30~50만", "미컨택", "", "", "", "", "", ""],
        [2, "@busan_zzzzzin_", "인스타", "~10~30K", "15~25만", "미컨택", "", "릴스", "", "", "", ""],
        [3, "@broculri13", "인스타+블로그", "~10~25K", "20~30만", "미컨택", "", "", "", "", "", ""],
        [4, "@muk__jina", "인스타+블로그", "~10~20K", "20~30만", "미컨택", "", "", "", "", "", ""],
        [5, "@busan_date_", "인스타", "~10~20K", "15~25만", "미컨택", "", "", "", "", "", ""],
        [6, "@busan.local.food", "인스타", "~5~15K", "10~20만", "미컨택", "", "", "", "", "", ""],
        [7, "@muk_jeong", "인스타", "~15~30K", "20~30만", "미컨택", "", "", "", "", "", ""],
    ]
    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")
    ws.batch_format([{"range": "A1:L1", "format": bwob()}])

    add_dropdown(ws, "F2:F50", ["미컨택", "DM발송", "수락", "거절", "협의중"])
    add_dropdown(ws, "H2:H50", ["릴스", "피드", "블로그", "유튜브"])
    add_dropdown(ws, "K2:K50", ["Y", "N"])

    add_cond_fmt(ws, "F2:F50", "수락", GREEN_BG, GREEN_FG)
    add_cond_fmt(ws, "F2:F50", "DM발송", ORANGE_BG, ORANGE_FG)
    add_cond_fmt(ws, "F2:F50", "거절", RED_BG, RED_FG)

    ws.freeze(rows=1)
    ws.columns_auto_resize(0, 11)
    print("  ✓ 인플루언서 관리")


def main():
    print("나머지 탭 추가 시작...")
    client = get_client()
    sh = client.open_by_key(SHEET_ID)

    existing = [ws.title for ws in sh.worksheets()]
    print(f"  기존 탭: {existing}")

    # 주차별 태스크가 비어있으면 데이터 채우기
    if "주차별 태스크" in existing:
        ws = sh.worksheet("주차별 태스크")
        val = ws.acell("A1").value
        if not val:
            print("  주차별 태스크 데이터 없음 — 채우기")
            fill_tasks(ws)
        else:
            print(f"  주차별 태스크 이미 있음 (A1={val})")

    if "KPI 트래킹" not in existing:
        create_kpi(sh)
        time.sleep(2)
    else:
        print("  KPI 트래킹 이미 있음 — 스킵")

    if "키워드 데이터" not in existing:
        create_keywords(sh)
        time.sleep(2)
    else:
        print("  키워드 데이터 이미 있음 — 스킵")

    if "체험단 관리" not in existing:
        create_experience(sh)
        time.sleep(2)
    else:
        print("  체험단 관리 이미 있음 — 스킵")

    if "인플루언서 관리" not in existing:
        create_influencer(sh)
        time.sleep(2)
    else:
        print("  인플루언서 관리 이미 있음 — 스킵")

    print(f"\n완료! URL: {sh.url}")


if __name__ == "__main__":
    main()
