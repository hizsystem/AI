#!/usr/bin/env python3
"""휴닉(HUENIC) 마스터시트 세팅 스크립트

휴닉 마스터시트 ID: 1crkZXjTlFd01vUGoaXs3zpNqgZBLh-xZwpqPQEDHDUY
- 종합-요약 탭 업데이트
- 예상매출 탭 생성 (견적서 기준)
- 예상지출 탭 생성
- 입금 현황 포함
"""

import sys
import time
sys.path.insert(0, ".")
from scripts.sheets_auth import get_client

HUENIC_SHEET_ID = "1crkZXjTlFd01vUGoaXs3zpNqgZBLh-xZwpqPQEDHDUY"


def setup_summary(sh):
    """탭 1: 종합-요약 (기존 Summary 탭 재활용)"""
    ws = sh.sheet1
    try:
        ws.update_title("종합-요약")
    except Exception:
        print("  (탭 이름 변경 건너뜀 — 기존 이름 유지)")
    ws.clear()

    # 매출/지출 탭 이름 확인 (실제 탭명으로 수식 참조)
    sheet_names = [s.title for s in sh.worksheets()]
    rev_tab = "예상매출" if "예상매출" in sheet_names else "2026 예상 매출"
    exp_tab = "예상지출" if "예상지출" in sheet_names else "2026 예상 지출"

    data = [
        ["[프로젝트 개요]", "", ""],
        ["프로젝트명", "휴닉 (HUENIC)", ""],
        ["클라이언트", "(주)휴닉 / 박진아 대표", ""],
        ["담당팀", "BC3팀 (Green, 남중, 수민, APD 2명)", ""],
        ["계약기간", "2026.03 ~ 2026.12 (10개월)", ""],
        ["계약금액", 107189370, "(VAT 별도)"],
        ["", "", ""],
        ["[핵심 수치 요약]", "", ""],
        ["총 예상매출", f"='{rev_tab}'!Q14", ""],
        ["총 예산(지출)", f"='{exp_tab}'!O9", ""],
        ["현재 실매출", 0, ""],
        ["현재 실지출", 0, ""],
        ["수익률", "=IF(B9>0,(B9-B10)/B9,0)", ""],
        ["", "", ""],
        ["[입금 현황]", "", ""],
        ["25년 미집행 비용 (VAT포함)", 8429000, "전년도 이월"],
        ["26년 1월 8일 선지급", 30000000, ""],
        ["입금 합계", "=SUM(B16:B17)", ""],
        ["잔여 계약금", "=B6*1.1-B18", "(VAT포함 기준)"],
        ["", "", ""],
        ["[업무 스콥]", "금액", "비고"],
        ["0) 전략 파트너십 (월간 브랜딩+IMC 회의)", 24000000, "월 200만 x 12"],
        ["1) 브랜딩 & 패키지 디자인", 12500000, "브랜드덱+패키지"],
        ["2) 인스타그램 기획 - VEGGIET", 30000000, "리서치+월간 기획보드"],
        ["3) 서울웰니스 (캐나다)", 30000000, "선물하기에서 전환"],
        ["4) 해외 인스타 - VINKER", 8000000, "월 80만 x 10"],
        ["5) 올영 체험단", 10689370, "선급 차감"],
        ["합계", 107189370, "VAT 별도 약 1.07억"],
    ]

    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")

    # 서식
    ws.batch_format([
        {"range": "A1", "format": {"textFormat": {"bold": True, "fontSize": 12}}},
        {"range": "A8", "format": {"textFormat": {"bold": True, "fontSize": 12}}},
        {"range": "A15", "format": {"textFormat": {"bold": True, "fontSize": 12}}},
        {"range": "A21", "format": {"textFormat": {"bold": True, "fontSize": 12}}},
        {"range": "A21:C21", "format": {"textFormat": {"bold": True}, "backgroundColor": {"red": 0.95, "green": 0.96, "blue": 0.97}}},
        {"range": "A28:C28", "format": {"textFormat": {"bold": True}, "backgroundColor": {"red": 0.9, "green": 0.91, "blue": 0.92}}},
        {"range": "A18:C18", "format": {"textFormat": {"bold": True}}},
        {"range": "A19:C19", "format": {"textFormat": {"bold": True}}},
        {"range": "B6", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
        {"range": "B9:B12", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
        {"range": "B13", "format": {"numberFormat": {"type": "PERCENT", "pattern": "0.0%"}}},
        {"range": "B16:B19", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
        {"range": "B22:B28", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
    ])

    print("  [1/3] 종합-요약 완료")


def setup_revenue(sh):
    """탭 2: 예상매출"""
    # 기존 탭 재활용 또는 신규 생성
    try:
        ws = sh.worksheet("예상매출")
        ws.clear()
        ws.resize(rows=20, cols=17)
    except Exception:
        try:
            ws = sh.worksheet("2026 예상 매출")
            ws.clear()
            ws.resize(rows=20, cols=17)
            try:
                ws.update_title("예상매출")
            except Exception:
                pass
        except Exception:
            ws = sh.add_worksheet(title="예상매출", rows=20, cols=17)

    headers = [
        "구분", "항목", "금액(공급가)",
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월",
        "비고", "연간합계"
    ]

    data = [
        headers,
        # row 2: 전략 파트너십 - 브랜딩 회의
        ["0) 전략 파트너십", "월간 브랜딩 회의 (대표급)", 14400000,
         1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
         1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
         "월 100만(공급가) x 12", "=SUM(D2:O2)"],
        # row 3: 전략 파트너십 - IMC 회의
        ["0) 전략 파트너십", "월간 IMC 회의 (실무급) + AI 대시보드", 9600000,
         0, 0, 960000, 960000, 960000, 960000,
         960000, 960000, 960000, 960000, 960000, 960000,
         "월 96만 x 10개월", "=SUM(D3:O3)"],
        # row 4: 브랜드덱
        ["1) 브랜딩&패키지", "영업용 브랜드덱 (국/영 4종)", 6000000,
         0, 0, 0, 6000000, 0, 0, 0, 0, 0, 0, 0, 0, "4월 납품", "=SUM(D4:O4)"],
        # row 5: 스트로베리 패키지
        ["1) 브랜딩&패키지", "스트로베리 패키지", 1000000,
         0, 1000000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "2월 완료", "=SUM(D5:O5)"],
        # row 6: 프로틴바
        ["1) 브랜딩&패키지", "프로틴바 3종 패키지", 3500000,
         0, 0, 0, 0, 3500000, 0, 0, 0, 0, 0, 0, 0, "5월 예정", "=SUM(D6:O6)"],
        # row 7: 슈퍼 클렌즈
        ["1) 브랜딩&패키지", "슈퍼 클렌즈 2종 패키지", 2000000,
         0, 0, 0, 0, 2000000, 0, 0, 0, 0, 0, 0, 0, "5월 예정", "=SUM(D7:O7)"],
        # row 8: 마켓 리서치 상반기
        ["2) 인스타 VEGGIET", "마켓 리서치 (상반기)", 5000000,
         0, 0, 0, 5000000, 0, 0, 0, 0, 0, 0, 0, 0, "", "=SUM(D8:O8)"],
        # row 9: 마켓 리서치 하반기
        ["2) 인스타 VEGGIET", "마켓 리서치 (하반기)", 5000000,
         0, 0, 0, 0, 0, 0, 0, 0, 5000000, 0, 0, 0, "", "=SUM(D9:O9)"],
        # row 10: 월간 기획보드
        ["2) 인스타 VEGGIET", "월간 기획보드 (월 200만 x 10)", 20000000,
         0, 0, 2000000, 2000000, 2000000, 2000000,
         2000000, 2000000, 2000000, 2000000, 2000000, 2000000, "", "=SUM(D10:O10)"],
        # row 11: 서울웰니스
        ["3) 서울웰니스", "캐나다 전용 (6개월)", 30000000,
         0, 0, 0, 0, 5000000, 5000000,
         5000000, 5000000, 5000000, 5000000, 0, 0, "5~10월", "=SUM(D11:O11)"],
        # row 12: VINKER
        ["4) VINKER", "빙커 최소유지 (월 80만 x 10)", 8000000,
         0, 0, 800000, 800000, 800000, 800000,
         800000, 800000, 800000, 800000, 800000, 800000, "3~12월", "=SUM(D12:O12)"],
        # row 13: 올영 체험단
        ["5) 올영 체험단", "체험단 운영 (선급 차감)", 10689370,
         7587370, 3102000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "1~2월 정산", "=SUM(D13:O13)"],
    ]

    # row 14: 합계
    total_row = ["합계", "", "=SUM(C2:C13)"]
    for col in "DEFGHIJKLMNO":
        col_num = ord(col) - 64  # D=4
        total_row.append(f"=SUM({col}2:{col}13)")
    total_row.append("")  # 비고
    total_row.append("=SUM(Q2:Q13)")  # 연간합계

    data.append(total_row)

    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")

    # 서식
    format_rules = [
        {"range": "A1:Q1", "format": {
            "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 0.2, "green": 0.2, "blue": 0.2}}},
            "backgroundColor": {"red": 0.95, "green": 0.96, "blue": 0.97},
        }},
        {"range": "A14:Q14", "format": {
            "textFormat": {"bold": True},
            "backgroundColor": {"red": 0.9, "green": 0.91, "blue": 0.92},
        }},
        {"range": "C2:C14", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
        {"range": "D2:O14", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
        {"range": "Q2:Q14", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
    ]

    # 구분별 배경색
    colors = {
        "0)": {"red": 0.94, "green": 0.99, "blue": 0.96},  # 연녹
        "1)": {"red": 0.94, "green": 0.96, "blue": 1.0},    # 연파
        "2)": {"red": 1.0, "green": 0.98, "blue": 0.92},    # 연황
        "3)": {"red": 0.99, "green": 0.94, "blue": 0.96},   # 연분홍
        "4)": {"red": 0.96, "green": 0.95, "blue": 1.0},    # 연보라
        "5)": {"red": 0.93, "green": 0.99, "blue": 0.96},   # 연민트
    }
    row_map = {
        "0)": [2, 3], "1)": [4, 5, 6, 7], "2)": [8, 9, 10],
        "3)": [11], "4)": [12], "5)": [13],
    }
    for prefix, rows in row_map.items():
        for r in rows:
            format_rules.append({
                "range": f"A{r}:Q{r}",
                "format": {"backgroundColor": colors[prefix]},
            })

    ws.batch_format(format_rules)
    print("  [2/3] 예상매출 완료")


def setup_expense(sh):
    """탭 3: 예상지출"""
    try:
        ws = sh.worksheet("예상지출")
        ws.clear()
        ws.resize(rows=15, cols=15)
    except Exception:
        try:
            ws = sh.worksheet("2026 예상 지출")
            ws.clear()
            ws.resize(rows=15, cols=15)
            try:
                ws.update_title("예상지출")
            except Exception:
                pass
        except Exception:
            ws = sh.add_worksheet(title="예상지출", rows=15, cols=15)

    headers = [
        "카테고리", "항목",
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월",
        "연간합계"
    ]

    data = [
        headers,
        ["인건비", "팀 인건비 (프로젝트 비율 배분)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "=SUM(C2:N2)"],
        ["외주비", "스튜디오 촬영 (상반기)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "=SUM(C3:N3)"],
        ["외주비", "인플루언서/시딩 비용", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "=SUM(C4:N4)"],
        ["광고비", "팔로워 광고비 (별도 선정)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "=SUM(C5:N5)"],
        ["툴비용", "피그마/캔바 등 (프로젝트 배분)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "=SUM(C6:N6)"],
        ["기타", "출장비/교통비 등", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "=SUM(C7:N7)"],
        ["기타", "올영 체험단 제품비 (선급 차감)", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "=SUM(C8:N8)"],
    ]

    # row 9: 합계
    total_row = ["합계", ""]
    for col in "CDEFGHIJKLMN":
        total_row.append(f"=SUM({col}2:{col}8)")
    total_row.append("=SUM(O2:O8)")
    data.append(total_row)

    ws.update(values=data, range_name="A1", value_input_option="USER_ENTERED")

    ws.batch_format([
        {"range": "A1:O1", "format": {
            "textFormat": {"bold": True},
            "backgroundColor": {"red": 0.95, "green": 0.96, "blue": 0.97},
        }},
        {"range": "A9:O9", "format": {
            "textFormat": {"bold": True},
            "backgroundColor": {"red": 0.9, "green": 0.91, "blue": 0.92},
        }},
        {"range": "C2:O9", "format": {"numberFormat": {"type": "NUMBER", "pattern": "#,##0"}}},
    ])

    # 노트 추가
    ws.update_note("A2", "인건비는 팀 총괄에서 프로젝트 비율로 배분. 지출 발생 시 여기에 기입.")

    print("  [3/3] 예상지출 완료")


def main():
    client = get_client()
    sh = client.open_by_key(HUENIC_SHEET_ID)
    print(f"휴닉 마스터시트 열기 완료: {sh.title}")
    print(f"URL: {sh.url}\n")

    print("=== 휴닉 마스터시트 세팅 시작 ===\n")

    setup_summary(sh)
    time.sleep(2)

    setup_revenue(sh)
    time.sleep(2)

    setup_expense(sh)

    print("\n=== 세팅 완료 ===")
    print(f"\n시트 URL: {sh.url}")
    print("\n포함 내용:")
    print("  1. 종합-요약: 프로젝트 개요 + 입금 현황 (25년 미집행 8,429,000 + 26.1.8 선지급 30,000,000)")
    print("  2. 예상매출: 견적서 기준 12개 항목, 월별 배분 (연간 107,189,370)")
    print("  3. 예상지출: 7개 카테고리 (금액 입력 대기)")


if __name__ == "__main__":
    main()
