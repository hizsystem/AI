#!/usr/bin/env python3
"""3/31 고벤처포럼 최종 참석자 탭 + 지표 요약 탭 생성

사용법:
  cd /Users/wooseongmin/AI
  python3 .claude/worktrees/goventure-forum/scripts/create_final_attendee_tab.py
"""

import sys, json, time
import gspread
from google.oauth2.credentials import Credentials

# ── 인증 ──
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

SHEET_URL = "https://docs.google.com/spreadsheets/d/1YtOd5pW9ECd_kQggWpk8VojUlpuMXn9PS7R1kBG4NiM/edit"
sh = client.open_by_url(SHEET_URL)

# ── 원본 데이터 읽기 ──
source_ws = None
for ws in sh.worksheets():
    if ws.id == 1110496034:  # ★리셉션_명단
        source_ws = ws
        break

raw = source_ws.get_all_values()
header = raw[0]  # ['#', '이름', '소속', '직책', '연락처', '이메일', '메뉴', '결제', '포스안내', '상담', '사전 결제 완료', '비고', ...]

# ── 데이터 정제 ──
attendees = []
seen_phones = set()

for row in raw[1:]:
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
    biz_card = row[12].strip() if len(row) > 12 else ""
    col_n = row[13].strip() if len(row) > 13 else ""
    col_o = row[14].strip() if len(row) > 14 else ""

    # 빈 행 스킵
    if not num and not name:
        continue
    # 메모 행 스킵
    if not num and name in ("현장 업데이트", "사전 결제 22명", "탭샵바 결제 66명"):
        continue
    if name.startswith("사전 결제 완료"):
        continue
    if not name:
        continue

    # #29 수정: 이름이 "37"로 잘못 입력됨 → 이경수 (비해브 본부장, 연락처/이메일로 식별)
    if name == "37" and org == "비해브":
        name = "이경수"

    # 전화번호 정규화 (중복 체크용)
    phone_norm = phone.replace("-", "").replace(" ", "").strip()

    # 고은철 중복 처리 (#49 솔로씨 + #58 slothy → 하나만)
    if phone_norm and phone_norm in seen_phones:
        continue
    if phone_norm:
        seen_phones.add(phone_norm)

    # 결제 상태 통일
    if payment == "결제완료":
        final_payment = "결제완료"
    elif pre_paid == "O":
        final_payment = "사전결제"
    elif "결제완료" in note:
        final_payment = "결제완료"
    elif pos_guide in ("결제", "결제+충전"):
        final_payment = "현장결제"
    elif biz_card == "명함수령" and not payment:
        final_payment = "현장결제"
    else:
        final_payment = "미확인"

    # 구분 (사전등록 vs 현장추가)
    try:
        n = int(num)
        reg_type = "사전등록" if n <= 61 else "현장추가"
    except ValueError:
        reg_type = "현장추가"

    # 메뉴 빈값 처리
    if not menu or menu == "확인":
        menu = "-"

    # 유형 추정 (col_o 또는 비고에서)
    attendee_type = col_o if col_o else ""
    if not attendee_type:
        if "부회장" in note or "한국농" in org:
            attendee_type = "기관 관계자"
        elif "VC" in note or "투자" in note:
            attendee_type = "VC (투자자)"

    attendees.append({
        "name": name,
        "org": org,
        "position": position,
        "phone": phone,
        "email": email,
        "menu": menu,
        "payment": final_payment,
        "consultation": consultation,
        "reg_type": reg_type,
        "note": note,
        "type": attendee_type,
    })

print(f"정제 완료: {len(attendees)}명")

# ── 1) 최종 참석자 탭 생성 ──
TAB1 = "✅ 최종 참석자 (0331)"
try:
    ws1 = sh.worksheet(TAB1)
    ws1.clear()
except gspread.exceptions.WorksheetNotFound:
    ws1 = sh.add_worksheet(title=TAB1, rows=200, cols=12)

headers1 = ["No", "이름", "소속", "직책", "연락처", "이메일", "메뉴", "결제상태", "등록구분", "상담", "유형", "비고"]
rows1 = [headers1]
for i, a in enumerate(attendees, 1):
    rows1.append([
        i,
        a["name"],
        a["org"],
        a["position"],
        a["phone"],
        a["email"],
        a["menu"],
        a["payment"],
        a["reg_type"],
        a["consultation"],
        a["type"],
        a["note"],
    ])

ws1.update(values=rows1, range_name="A1", value_input_option="USER_ENTERED")
time.sleep(1)

# 헤더 서식
ws1.batch_format([
    {"range": "A1:L1", "format": {
        "textFormat": {"bold": True, "foregroundColorStyle": {"rgbColor": {"red": 1, "green": 1, "blue": 1}}},
        "backgroundColor": {"red": 0.15, "green": 0.15, "blue": 0.15},
        "horizontalAlignment": "CENTER",
    }},
])
time.sleep(1)

# 등록구분별 색상
formats1 = []
for i, a in enumerate(attendees, 2):
    if a["reg_type"] == "현장추가":
        formats1.append({
            "range": f"A{i}:L{i}",
            "format": {"backgroundColor": {"red": 1.0, "green": 0.96, "blue": 0.88}},
        })
if formats1:
    ws1.batch_format(formats1)
    time.sleep(1)

print(f"✅ '{TAB1}' 생성 완료 ({len(attendees)}명)")

# ── 2) 지표 요약 탭 생성 ──
TAB2 = "📊 지표 요약 (0331)"
try:
    ws2 = sh.worksheet(TAB2)
    ws2.clear()
except gspread.exceptions.WorksheetNotFound:
    ws2 = sh.add_worksheet(title=TAB2, rows=60, cols=6)

# 집계 계산
total = len(attendees)
pre_reg = sum(1 for a in attendees if a["reg_type"] == "사전등록")
walk_in = sum(1 for a in attendees if a["reg_type"] == "현장추가")

pay_pre = sum(1 for a in attendees if a["payment"] in ("결제완료", "사전결제"))
pay_onsite = sum(1 for a in attendees if a["payment"] == "현장결제")
pay_unknown = sum(1 for a in attendees if a["payment"] == "미확인")

menu_wine = sum(1 for a in attendees if "와인" in a["menu"])
menu_coffee = sum(1 for a in attendees if "커피" in a["menu"])
menu_other = total - menu_wine - menu_coffee

consult_pre = sum(1 for a in attendees if "사전" in a["consultation"])
consult_extra = sum(1 for a in attendees if "별도" in a["consultation"])
consult_both = sum(1 for a in attendees if "사전" in a["consultation"] and "별도" in a["consultation"])

# 소속 유형 분류
type_startup = 0
type_vc = 0
type_institution = 0
type_other = 0
for a in attendees:
    t = a["type"].lower()
    if "vc" in t or "투자" in t:
        type_vc += 1
    elif "기관" in t:
        type_institution += 1
    elif "스타트업" in t:
        type_startup += 1
    else:
        # 직책 기반 추정
        if a["position"] in ("대표", "CEO", "대표이사"):
            type_startup += 1
        elif a["org"] and ("대학" in a["org"] or "공사" in a["org"] or "은행" in a["org"] or "진흥원" in a["org"]):
            type_institution += 1
        else:
            type_other += 1

# 소속 기업/기관 유니크 수
orgs = set()
for a in attendees:
    if a["org"] and a["org"] != "-":
        orgs.add(a["org"])

rows2 = [
    ["제189회 고벤처포럼 지표 요약", "", "", "", "", ""],
    ["행사일: 2026-03-31(화)", "", "", "", "", ""],
    ["보고일: 2026-04-07(월)", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    # ── 핵심 지표 ──
    ["📌 핵심 지표", "", "", "", "", ""],
    ["", "항목", "수치", "비율", "", ""],
    ["", "총 참석자", total, "100%", "", ""],
    ["", "사전 등록", pre_reg, f"{pre_reg/total*100:.0f}%", "", ""],
    ["", "현장 추가", walk_in, f"{walk_in/total*100:.0f}%", "", ""],
    ["", "참여 기업/기관 수", len(orgs), "", "", ""],
    ["", "", "", "", "", ""],
    # ── 결제 현황 ──
    ["💰 결제 현황", "", "", "", "", ""],
    ["", "항목", "수치", "비율", "", ""],
    ["", "사전 결제 완료", pay_pre, f"{pay_pre/total*100:.0f}%", "", ""],
    ["", "현장 결제", pay_onsite, f"{pay_onsite/total*100:.0f}%", "", ""],
    ["", "미확인", pay_unknown, f"{pay_unknown/total*100:.0f}%", "", ""],
    ["", "", "", "", "", ""],
    # ── 메뉴 선택 ──
    ["🍷 메뉴 선택", "", "", "", "", ""],
    ["", "항목", "수치", "비율", "", ""],
    ["", "와인", menu_wine, f"{menu_wine/total*100:.0f}%", "", ""],
    ["", "커피/음료", menu_coffee, f"{menu_coffee/total*100:.0f}%", "", ""],
    ["", "미선택/확인", menu_other, f"{menu_other/total*100:.0f}%", "", ""],
    ["", "", "", "", "", ""],
    # ── 상담 현황 ──
    ["💬 1:1 상담 신청", "", "", "", "", ""],
    ["", "항목", "수치", "", "", ""],
    ["", "사전 상담 신청", consult_pre, "", "", ""],
    ["", "별도 상담 신청", consult_extra, "", "", ""],
    ["", "사전+별도 모두", consult_both, "", "", ""],
    ["", "", "", "", "", ""],
    # ── 참석자 유형 ──
    ["👥 참석자 유형 (추정)", "", "", "", "", ""],
    ["", "항목", "수치", "비율", "", ""],
    ["", "창업자/스타트업", type_startup, f"{type_startup/total*100:.0f}%", "", ""],
    ["", "VC/투자자", type_vc, f"{type_vc/total*100:.0f}%", "", ""],
    ["", "기관 관계자", type_institution, f"{type_institution/total*100:.0f}%", "", ""],
    ["", "기타/미분류", type_other, f"{type_other/total*100:.0f}%", "", ""],
    ["", "", "", "", "", ""],
    # ── 특이사항 ──
    ["⚠️ 특이사항", "", "", "", "", ""],
    ["", "1. 고은철: 솔로씨/slothy 중복 등록 → 1건으로 통합", "", "", "", ""],
    ["", "2. #51 김보석(셀리랩): '본인 아니라고 하심' — 확인 필요", "", "", "", ""],
    ["", "3. #55 위도영(한국와인문화협회): BLACKLIST 표기", "", "", "", ""],
    ["", "4. #73 김승요: 사전/현장 결제 모두 없음", "", "", "", ""],
    ["", "5. #31 이상준(코스윌): 미결제로 표시되나 비고에 '결제완료' 메모", "", "", "", ""],
    ["", "6. 이상학 부회장님 동행 6명 (한국농어촌공사 등)", "", "", "", ""],
]

ws2.update(values=rows2, range_name="A1", value_input_option="USER_ENTERED")
time.sleep(1)

# 서식 적용
section_rows = [1, 5, 12, 18, 24, 31, 38]
section_formats = []
# 타이틀
section_formats.append({
    "range": "A1:F1",
    "format": {
        "textFormat": {"bold": True, "fontSize": 14},
    },
})
# 섹션 헤더
for r in section_rows[1:]:
    section_formats.append({
        "range": f"A{r}:F{r}",
        "format": {
            "textFormat": {"bold": True, "fontSize": 11},
            "backgroundColor": {"red": 0.93, "green": 0.93, "blue": 0.93},
        },
    })
# 서브 헤더 (항목/수치/비율)
sub_header_rows = [6, 13, 19, 25, 32]
for r in sub_header_rows:
    section_formats.append({
        "range": f"B{r}:D{r}",
        "format": {"textFormat": {"bold": True}},
    })

ws2.batch_format(section_formats)
time.sleep(1)

print(f"📊 '{TAB2}' 생성 완료")
print(f"\n=== 최종 집계 ===")
print(f"총 참석자: {total}명 (사전등록 {pre_reg} + 현장추가 {walk_in})")
print(f"결제: 사전 {pay_pre} / 현장 {pay_onsite} / 미확인 {pay_unknown}")
print(f"메뉴: 와인 {menu_wine} / 커피 {menu_coffee} / 기타 {menu_other}")
print(f"참여 기업/기관: {len(orgs)}곳")
print(f"상담 신청: 사전 {consult_pre} / 별도 {consult_extra}")
