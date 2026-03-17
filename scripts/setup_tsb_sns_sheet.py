#!/usr/bin/env python3
"""탭샵바 SNS 데이터 시트 자동 세팅 스크립트

기존 빈 Google Sheet에 5개 탭을 생성하고 헤더/서식을 세팅한다.
- 주간성과 (인스타그램)
- 게시물별 성과
- 월간KPI
- 팔로워추이
- 카카오플러스친구
"""

import sys
import time
import gspread
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

SHEET_ID = "1Y_Uo3QvkPsFo6k0pHGkAVZ8Bl1OI0Ou15UVuxlMs6Ks"

HEADER_FMT = {
    "backgroundColor": {"red": 0.15, "green": 0.15, "blue": 0.15},
    "textFormat": {"bold": True, "fontSize": 10, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
    "horizontalAlignment": "CENTER",
    "verticalAlignment": "MIDDLE",
}

SUB_HEADER_FMT = {
    "backgroundColor": {"red": 0.95, "green": 0.95, "blue": 0.95},
    "textFormat": {"fontSize": 9, "foregroundColorStyle": {"rgbColor": {"red": 0.4, "green": 0.4, "blue": 0.4}}},
    "horizontalAlignment": "CENTER",
}

def pause():
    """API 호출 사이 잠깐 대기"""
    time.sleep(1.5)


def get_or_create_worksheet(sh, title, rows=200, cols=15):
    """시트가 이미 있으면 가져오고 없으면 생성"""
    try:
        ws = sh.worksheet(title)
        print(f"    (기존 탭 '{title}' 사용)")
        return ws
    except gspread.exceptions.WorksheetNotFound:
        ws = sh.add_worksheet(title=title, rows=rows, cols=cols)
        pause()
        return ws


def setup_weekly(sh):
    """탭 1: 주간성과"""
    # 기본 시트(Sheet1) 재활용
    ws = sh.sheet1
    ws.update_title("주간성과")
    pause()

    headers = [
        "주차", "기간", "팔로워", "팔로워증감",
        "게시물수", "도달", "도달증감", "노출",
        "참여율", "참여율증감", "프로필방문", "링크클릭", "비고"
    ]
    desc = [
        "2026-W14", "3/31~4/6", "월말 수", "+/-",
        "주간 발행", "주간 총", "+/-", "주간 총",
        "% (참여/팔로워)", "pp", "주간", "바이오 링크", "특이사항"
    ]

    ws.update(values=[headers, desc], range_name="A1")
    ws.batch_format([
        {"range": "A1:M1", "format": HEADER_FMT},
        {"range": "A2:M2", "format": SUB_HEADER_FMT},
    ])
    ws.freeze(rows=2)
    ws.update_note("A1", "매주 월요일 업데이트. 인스타그램 인사이트 기준.")

    # 컬럼 너비 조정
    requests = [
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 1},
            "properties": {"pixelSize": 100}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 1, "endIndex": 2},
            "properties": {"pixelSize": 110}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 12, "endIndex": 13},
            "properties": {"pixelSize": 200}, "fields": "pixelSize"}},
    ]
    sh.batch_update({"requests": requests})
    pause()
    print("  [1/5] 주간성과 완료")


def setup_post_metrics(sh):
    """탭 2: 게시물별 성과"""
    ws = get_or_create_worksheet(sh, "게시물별 성과", rows=200, cols=15)
    pause()

    headers = [
        "발행일", "제목", "카테고리", "포맷", "주력타겟",
        "도달", "노출", "좋아요", "댓글", "저장", "공유",
        "참여율", "팔로워전환", "비고"
    ]
    desc = [
        "YYYY-MM-DD", "콘텐츠 제목", "시리즈명", "릴스/캐러셀/카드뉴스/이미지",
        "지은/민준/커플/전체",
        "게시물", "게시물", "", "", "", "",
        "%", "이 게시물로 팔로우", "발행 7일 후 기록"
    ]

    ws.update(values=[headers, desc], range_name="A1")
    ws.batch_format([
        {"range": "A1:N1", "format": HEADER_FMT},
        {"range": "A2:N2", "format": SUB_HEADER_FMT},
    ])
    ws.freeze(rows=2)

    # 드롭다운 (batch_update로 data validation 추가)
    def make_dropdown_request(sheet_id, col_idx, values):
        return {
            "setDataValidation": {
                "range": {
                    "sheetId": sheet_id,
                    "startRowIndex": 2, "endRowIndex": 200,
                    "startColumnIndex": col_idx, "endColumnIndex": col_idx + 1,
                },
                "rule": {
                    "condition": {
                        "type": "ONE_OF_LIST",
                        "values": [{"userEnteredValue": v} for v in values],
                    },
                    "showCustomUi": True,
                    "strict": False,
                },
            }
        }

    validation_requests = [
        make_dropdown_request(ws.id, 2, ["탭샵바플레이스", "탭샵바페어링", "탭샵바씬", "탭샵바뉴", "이달의탭"]),
        make_dropdown_request(ws.id, 3, ["릴스", "캐러셀", "카드뉴스", "이미지", "스토리"]),
        make_dropdown_request(ws.id, 4, ["지은(발견)", "민준(루틴)", "커플(분위기)", "전체(알고리즘)"]),
    ]
    sh.batch_update({"requests": validation_requests})
    pause()

    # 컬럼 너비
    requests = [
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 1, "endIndex": 2},
            "properties": {"pixelSize": 200}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 2, "endIndex": 3},
            "properties": {"pixelSize": 130}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 13, "endIndex": 14},
            "properties": {"pixelSize": 200}, "fields": "pixelSize"}},
    ]
    sh.batch_update({"requests": requests})
    pause()
    print("  [2/5] 게시물별 성과 완료")


def setup_monthly_kpi(sh):
    """탭 3: 월간KPI"""
    ws = get_or_create_worksheet(sh, "월간KPI", rows=50, cols=17)
    pause()

    headers = [
        "연도", "월", "팔로워", "팔로워증감", "팔로워증감률",
        "월간게시물", "게시물증감", "게시물증감률",
        "평균참여율", "참여율증감",
        "월간도달", "도달증감", "도달증감률",
        "월간저장수", "월간공유수", "베스트콘텐츠", "비고"
    ]
    desc = [
        "", "", "월말 기준", "+/-", "%",
        "해당 월", "+/-", "%",
        "%", "pp",
        "월 총", "+/-", "%",
        "월 총", "월 총", "도달 기준", ""
    ]

    ws.update(values=[headers, desc], range_name="A1")
    ws.batch_format([
        {"range": "A1:Q1", "format": HEADER_FMT},
        {"range": "A2:Q2", "format": SUB_HEADER_FMT},
    ])
    ws.freeze(rows=2)
    ws.update_note("A1", "매월 1일 업데이트. 전월 데이터 정리.")

    requests = [
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 15, "endIndex": 16},
            "properties": {"pixelSize": 180}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 16, "endIndex": 17},
            "properties": {"pixelSize": 200}, "fields": "pixelSize"}},
    ]
    sh.batch_update({"requests": requests})
    pause()
    print("  [3/5] 월간KPI 완료")


def setup_follower_trend(sh):
    """탭 4: 팔로워추이"""
    ws = get_or_create_worksheet(sh, "팔로워추이", rows=50, cols=4)
    pause()

    headers = ["월", "전체", "자연유입", "광고"]
    desc = ["YYYY-MM", "월말 팔로워", "오가닉 (추정)", "유료 유입 (추정)"]

    ws.update(values=[headers, desc], range_name="A1")
    ws.batch_format([
        {"range": "A1:D1", "format": HEADER_FMT},
        {"range": "A2:D2", "format": SUB_HEADER_FMT},
    ])
    ws.freeze(rows=2)
    ws.update_note("A1", "매월 1일 업데이트. 대시보드 차트용 데이터.")
    pause()
    print("  [4/5] 팔로워추이 완료")


def setup_kakao(sh):
    """탭 5: 카카오플러스친구"""
    ws = get_or_create_worksheet(sh, "카카오플러스친구", rows=200, cols=13)
    pause()

    headers = [
        "날짜", "유형", "친구수", "신규친구", "차단",
        "순증감", "메시지발송", "발송수", "열람율",
        "클릭율", "차단율", "캠페인내용", "비고"
    ]
    desc = [
        "YYYY-MM-DD", "주간/월간/캠페인", "현재", "기간 내", "기간 내",
        "신규-차단", "발송 횟수", "발송 건수", "%",
        "%", "% (메시지 차단)", "", ""
    ]

    ws.update(values=[headers, desc], range_name="A1")
    ws.batch_format([
        {"range": "A1:M1", "format": HEADER_FMT},
        {"range": "A2:M2", "format": SUB_HEADER_FMT},
    ])
    ws.freeze(rows=2)

    # 유형 드롭다운
    sh.batch_update({"requests": [{
        "setDataValidation": {
            "range": {
                "sheetId": ws.id,
                "startRowIndex": 2, "endRowIndex": 200,
                "startColumnIndex": 1, "endColumnIndex": 2,
            },
            "rule": {
                "condition": {
                    "type": "ONE_OF_LIST",
                    "values": [{"userEnteredValue": v} for v in ["주간", "월간", "캠페인"]],
                },
                "showCustomUi": True,
                "strict": False,
            },
        }
    }]})
    pause()

    requests = [
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 11, "endIndex": 12},
            "properties": {"pixelSize": 200}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {
            "range": {"sheetId": ws.id, "dimension": "COLUMNS", "startIndex": 12, "endIndex": 13},
            "properties": {"pixelSize": 200}, "fields": "pixelSize"}},
    ]
    sh.batch_update({"requests": requests})
    pause()
    print("  [5/5] 카카오플러스친구 완료")


def main():
    print("탭샵바 SNS 데이터 시트 세팅 시작...")
    print(f"  시트 ID: {SHEET_ID}")
    print()

    client = get_client()
    sh = client.open_by_key(SHEET_ID)
    print(f"  시트 열기 완료: {sh.title}")
    print()

    setup_weekly(sh)
    setup_post_metrics(sh)
    setup_monthly_kpi(sh)
    setup_follower_trend(sh)
    setup_kakao(sh)

    print()
    print("완료! 5개 탭 세팅됨:")
    print("  1. 주간성과 — 매주 월요일 인스타 인사이트")
    print("  2. 게시물별 성과 — 발행 7일 후 기록 (카테고리/포맷/타겟 드롭다운)")
    print("  3. 월간KPI — 매월 1일 롤업")
    print("  4. 팔로워추이 — 월별 누적 차트용")
    print("  5. 카카오플러스친구 — 주간/캠페인별")
    print()
    print(f"  시트: https://docs.google.com/spreadsheets/d/{SHEET_ID}")


if __name__ == "__main__":
    main()
