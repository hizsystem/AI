"""미례국밥 제안서 Google Slides 생성 스크립트"""

import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

TOKEN_PATH = os.path.join(os.path.dirname(__file__), "..", ".secrets", "token.json")
# Fallback to main repo if not found in worktree
if not os.path.exists(TOKEN_PATH):
    TOKEN_PATH = os.path.expanduser("~/AI/.secrets/token.json")

# ─── 색상 팔레트 ───
WHITE = {"red": 1, "green": 1, "blue": 1}
BLACK = {"red": 0.13, "green": 0.13, "blue": 0.13}
DARK_GRAY = {"red": 0.3, "green": 0.3, "blue": 0.3}
MID_GRAY = {"red": 0.55, "green": 0.55, "blue": 0.55}
LIGHT_GRAY = {"red": 0.95, "green": 0.95, "blue": 0.95}
BRAND_BLUE = {"red": 0.10, "green": 0.34, "blue": 0.86}       # #1a56db
BRAND_NAVY = {"red": 0.06, "green": 0.10, "blue": 0.20}       # #101A33
BRAND_ORANGE = {"red": 1.0, "green": 0.42, "blue": 0.21}      # #FF6B35
ACCENT_BLUE_BG = {"red": 0.93, "green": 0.95, "blue": 1.0}    # 연한 블루 배경
CARD_BG = {"red": 0.97, "green": 0.97, "blue": 0.98}

# ─── 단위 (EMU) ───
INCH = 914400
CM = 360000
SLIDE_W = 10 * INCH   # 10 inches
SLIDE_H = 7.5 * INCH  # 7.5 inches (표준 16:9가 아닌 4:3. 16:9는 아래서 설정)


def get_slides_service():
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
    return build("slides", "v1", credentials=creds)


def emu(inches):
    return int(inches * INCH)


def textbox(page_id, obj_id, x, y, w, h):
    """텍스트박스 생성 요청"""
    return {
        "createShape": {
            "objectId": obj_id,
            "shapeType": "TEXT_BOX",
            "elementProperties": {
                "pageObjectId": page_id,
                "size": {"width": {"magnitude": emu(w), "unit": "EMU"},
                         "height": {"magnitude": emu(h), "unit": "EMU"}},
                "transform": {
                    "scaleX": 1, "scaleY": 1,
                    "translateX": emu(x), "translateY": emu(y),
                    "unit": "EMU",
                },
            },
        }
    }


def insert_text(obj_id, text):
    return {"insertText": {"objectId": obj_id, "text": text, "insertionIndex": 0}}


def style_text(obj_id, start, end, font_size, bold=False, color=None, font="Pretendard"):
    req = {
        "updateTextStyle": {
            "objectId": obj_id,
            "style": {
                "fontSize": {"magnitude": font_size, "unit": "PT"},
                "bold": bold,
                "fontFamily": font,
            },
            "textRange": {"type": "FIXED_RANGE", "startIndex": start, "endIndex": end},
            "fields": "fontSize,bold,fontFamily",
        }
    }
    if color:
        req["updateTextStyle"]["style"]["foregroundColor"] = {
            "opaqueColor": {"rgbColor": color}
        }
        req["updateTextStyle"]["fields"] += ",foregroundColor"
    return req


def style_paragraph(obj_id, start, end, alignment="START"):
    return {
        "updateParagraphStyle": {
            "objectId": obj_id,
            "style": {"alignment": alignment},
            "textRange": {"type": "FIXED_RANGE", "startIndex": start, "endIndex": end},
            "fields": "alignment",
        }
    }


def shape_bg(obj_id, color):
    return {
        "updateShapeProperties": {
            "objectId": obj_id,
            "shapeProperties": {
                "shapeBackgroundFill": {
                    "solidFill": {"color": {"rgbColor": color}}
                }
            },
            "fields": "shapeBackgroundFill.solidFill.color",
        }
    }


def shape_border(obj_id, color, weight_pt=1):
    return {
        "updateShapeProperties": {
            "objectId": obj_id,
            "shapeProperties": {
                "outline": {
                    "outlineFill": {"solidFill": {"color": {"rgbColor": color}}},
                    "weight": {"magnitude": weight_pt, "unit": "PT"},
                }
            },
            "fields": "outline",
        }
    }


def no_border(obj_id):
    return {
        "updateShapeProperties": {
            "objectId": obj_id,
            "shapeProperties": {
                "outline": {"propertyState": "NOT_RENDERED"}
            },
            "fields": "outline.propertyState",
        }
    }


def rect(page_id, obj_id, x, y, w, h, color):
    """배경용 사각형"""
    return {
        "createShape": {
            "objectId": obj_id,
            "shapeType": "RECTANGLE",
            "elementProperties": {
                "pageObjectId": page_id,
                "size": {"width": {"magnitude": emu(w), "unit": "EMU"},
                         "height": {"magnitude": emu(h), "unit": "EMU"}},
                "transform": {
                    "scaleX": 1, "scaleY": 1,
                    "translateX": emu(x), "translateY": emu(y),
                    "unit": "EMU",
                },
            },
        }
    }


def create_table(page_id, obj_id, rows, cols, x, y, w, h):
    return {
        "createTable": {
            "objectId": obj_id,
            "rows": rows,
            "columns": cols,
            "elementProperties": {
                "pageObjectId": page_id,
                "size": {"width": {"magnitude": emu(w), "unit": "EMU"},
                         "height": {"magnitude": emu(h), "unit": "EMU"}},
                "transform": {
                    "scaleX": 1, "scaleY": 1,
                    "translateX": emu(x), "translateY": emu(y),
                    "unit": "EMU",
                },
            },
        }
    }


# ─── 슬라이드 빌더 ───

def build_slide_requests():
    """10장 슬라이드 + 1장 요약 = 총 11장"""
    requests = []
    slides = []

    # 슬라이드 ID 생성
    for i in range(11):
        sid = f"slide_{i:02d}"
        slides.append(sid)
        requests.append({"createSlide": {"objectId": sid, "insertionIndex": i}})

    # ─── 슬라이드 0: 표지 ───
    s = slides[0]
    # 네이비 배경
    requests.append(rect(s, f"{s}_bg", 0, 0, 10, 5.625, BRAND_NAVY))
    requests.append(no_border(f"{s}_bg"))
    # 타이틀
    requests.append(textbox(s, f"{s}_title", 0.8, 1.2, 8.4, 1.2))
    requests.append(insert_text(f"{s}_title", "미례국밥\n마케팅 제안서"))
    requests.append(style_text(f"{s}_title", 0, 5, 40, bold=True, color=WHITE))
    requests.append(style_text(f"{s}_title", 5, 13, 40, bold=True, color=WHITE))
    requests.append(style_paragraph(f"{s}_title", 0, 13, "CENTER"))
    requests.append(no_border(f"{s}_title"))
    # 서브타이틀
    requests.append(textbox(s, f"{s}_sub", 1.5, 3.0, 7, 0.5))
    requests.append(insert_text(f"{s}_sub", "\"돼지우동, 서울이 알게 합니다\""))
    requests.append(style_text(f"{s}_sub", 0, 17, 18, color=BRAND_ORANGE))
    requests.append(style_paragraph(f"{s}_sub", 0, 17, "CENTER"))
    requests.append(no_border(f"{s}_sub"))
    # 하단 정보
    requests.append(textbox(s, f"{s}_info", 1.5, 4.2, 7, 0.8))
    requests.append(insert_text(f"{s}_info", "2026.03 | 브랜드라이즈\nbrandrise.co.kr"))
    requests.append(style_text(f"{s}_info", 0, 22, 13, color=MID_GRAY))
    requests.append(style_text(f"{s}_info", 22, 37, 11, color=MID_GRAY))
    requests.append(style_paragraph(f"{s}_info", 0, 37, "CENTER"))
    requests.append(no_border(f"{s}_info"))

    # ─── 슬라이드 1: 현재 상황 진단 ───
    s = slides[1]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 2, 0.4))
    requests.append(insert_text(f"{s}_label", "01  현재 상황"))
    requests.append(style_text(f"{s}_label", 0, 8, 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "부산에서는 성공했습니다. 문제는 서울입니다."))
    requests.append(style_text(f"{s}_title", 0, 22, 26, bold=True, color=BLACK))
    requests.append(no_border(f"{s}_title"))

    # 잘 하고 있는 것
    good_text = "✓ 리뷰 900건+ — 부산 내 신뢰도 확보 완료\n✓ 블로그 체험단 15팀 — 기본 SEO 자산 축적\n✓ 돼지우동 — 명확한 시그니처 메뉴 보유"
    requests.append(rect(s, f"{s}_good_bg", 0.6, 1.5, 4.1, 2.0, ACCENT_BLUE_BG))
    requests.append(no_border(f"{s}_good_bg"))
    requests.append(textbox(s, f"{s}_good_h", 0.8, 1.55, 3.7, 0.35))
    requests.append(insert_text(f"{s}_good_h", "잘 하고 계신 것"))
    requests.append(style_text(f"{s}_good_h", 0, 8, 12, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_good_h"))
    requests.append(textbox(s, f"{s}_good", 0.8, 1.95, 3.7, 1.4))
    requests.append(insert_text(f"{s}_good", good_text))
    requests.append(style_text(f"{s}_good", 0, len(good_text), 11, color=DARK_GRAY))
    requests.append(no_border(f"{s}_good"))

    # 아쉬운 점
    bad_text = "✗ 월 100~150만원 투입 vs 서울 인지도 제로\n✗ 인스타 \"기본적 내용만\" — 알고리즘 노출 안됨\n✗ 동동국밥 서울 마곡 진출 → 선점 기회 감소"
    requests.append(rect(s, f"{s}_bad_bg", 5.3, 1.5, 4.1, 2.0, {"red": 1.0, "green": 0.95, "blue": 0.93}))
    requests.append(no_border(f"{s}_bad_bg"))
    requests.append(textbox(s, f"{s}_bad_h", 5.5, 1.55, 3.7, 0.35))
    requests.append(insert_text(f"{s}_bad_h", "놓치고 계신 것"))
    requests.append(style_text(f"{s}_bad_h", 0, 7, 12, bold=True, color=BRAND_ORANGE))
    requests.append(no_border(f"{s}_bad_h"))
    requests.append(textbox(s, f"{s}_bad", 5.5, 1.95, 3.7, 1.4))
    requests.append(insert_text(f"{s}_bad", bad_text))
    requests.append(style_text(f"{s}_bad", 0, len(bad_text), 11, color=DARK_GRAY))
    requests.append(no_border(f"{s}_bad"))

    # 핵심 메시지
    requests.append(rect(s, f"{s}_msg_bg", 0.6, 3.8, 8.8, 1.2, BRAND_NAVY))
    requests.append(no_border(f"{s}_msg_bg"))
    requests.append(textbox(s, f"{s}_msg", 0.9, 3.9, 8.2, 1.0))
    msg = "좋은 메뉴(돼지우동)가 있는데, 부산 밖에서는 아무도 모릅니다.\n동동국밥이 서울에 먼저 깃발 꽂으면 \"국밥 프랜차이즈 = 동동\" 이미지가 굳어집니다."
    requests.append(insert_text(f"{s}_msg", msg))
    requests.append(style_text(f"{s}_msg", 0, len(msg), 13, color=WHITE))
    requests.append(style_paragraph(f"{s}_msg", 0, len(msg), "CENTER"))
    requests.append(no_border(f"{s}_msg"))

    # ─── 슬라이드 2: 핵심 문제 ───
    s = slides[2]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 2, 0.4))
    requests.append(insert_text(f"{s}_label", "02  핵심 문제"))
    requests.append(style_text(f"{s}_label", 0, 8, 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "지금이 아니면, 6개월 후엔 3배 비용이 듭니다"))
    requests.append(style_text(f"{s}_title", 0, 24, 26, bold=True, color=BLACK))
    requests.append(no_border(f"{s}_title"))

    # 타임라인
    tl = "현재                        3개월 후                     6개월 후\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n미례국밥                    서울 온라인                  서울 매장\n부산 only                   인지도 확보                  오픈 가능\n\n                              ⚠ 동동국밥 서울 마곡 오픈\n                              이 시점 전에 선점 필수!"
    requests.append(textbox(s, f"{s}_tl", 0.6, 1.6, 8.8, 2.5))
    requests.append(insert_text(f"{s}_tl", tl))
    requests.append(style_text(f"{s}_tl", 0, len(tl), 12, color=DARK_GRAY, font="Courier New"))
    requests.append(no_border(f"{s}_tl"))

    # 핵심 메시지
    requests.append(rect(s, f"{s}_box", 0.6, 4.2, 8.8, 1.0, BRAND_NAVY))
    requests.append(no_border(f"{s}_box"))
    key_msg = "지금 월 500만원으로 할 수 있는 일을,\n6개월 후에는 1,500만원을 써도 못합니다."
    requests.append(textbox(s, f"{s}_key", 1.0, 4.3, 8.0, 0.8))
    requests.append(insert_text(f"{s}_key", key_msg))
    requests.append(style_text(f"{s}_key", 0, len(key_msg), 16, bold=True, color=WHITE))
    requests.append(style_paragraph(f"{s}_key", 0, len(key_msg), "CENTER"))
    requests.append(no_border(f"{s}_key"))

    # ─── 슬라이드 3: A안 요약 ───
    s = slides[3]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 2, 0.4))
    requests.append(insert_text(f"{s}_label", "03  A안"))
    requests.append(style_text(f"{s}_label", 0, 6, 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "바이럴 집중형 — 빠른 임팩트"))
    requests.append(style_text(f"{s}_title", 0, 15, 26, bold=True, color=BLACK))
    requests.append(no_border(f"{s}_title"))

    requests.append(textbox(s, f"{s}_concept", 0.6, 1.3, 8.8, 0.4))
    concept_a = "\"국밥집인데 우동이 제일 잘 나가요\" — 이 의외성이 바이럴의 핵심"
    requests.append(insert_text(f"{s}_concept", concept_a))
    requests.append(style_text(f"{s}_concept", 0, len(concept_a), 13, color=BRAND_ORANGE))
    requests.append(no_border(f"{s}_concept"))

    # 3개월 요약 카드
    months_a = [
        ("1개월차: 폭탄 투하", "숏폼 4편 + 인플루언서 3명\n인스타 광고 (서울 2030)\n콘텐츠 전략 수립", "500만원"),
        ("2개월차: 확산", "유튜버 2팀 (10~50만 구독)\n숏폼 4편 + 광고 확대\n인스타 콘텐츠 운영", "500만원"),
        ("3개월차: 수확", "가맹 LP 광고 + 리타겟팅\n성과 콘텐츠 제작\n서울 진출 상권 분석", "500만원"),
    ]
    for idx, (month_title, details, cost) in enumerate(months_a):
        cx = 0.6 + idx * 3.1
        requests.append(rect(s, f"{s}_card{idx}", cx, 1.9, 2.8, 2.6, CARD_BG))
        requests.append(shape_border(f"{s}_card{idx}", BRAND_BLUE, 1))
        # 월 제목
        requests.append(textbox(s, f"{s}_mt{idx}", cx + 0.15, 2.0, 2.5, 0.35))
        requests.append(insert_text(f"{s}_mt{idx}", month_title))
        requests.append(style_text(f"{s}_mt{idx}", 0, len(month_title), 11, bold=True, color=BRAND_BLUE))
        requests.append(no_border(f"{s}_mt{idx}"))
        # 내용
        requests.append(textbox(s, f"{s}_md{idx}", cx + 0.15, 2.4, 2.5, 1.4))
        requests.append(insert_text(f"{s}_md{idx}", details))
        requests.append(style_text(f"{s}_md{idx}", 0, len(details), 10, color=DARK_GRAY))
        requests.append(no_border(f"{s}_md{idx}"))
        # 비용
        requests.append(textbox(s, f"{s}_mc{idx}", cx + 0.15, 3.9, 2.5, 0.35))
        requests.append(insert_text(f"{s}_mc{idx}", cost))
        requests.append(style_text(f"{s}_mc{idx}", 0, len(cost), 14, bold=True, color=BRAND_BLUE))
        requests.append(style_paragraph(f"{s}_mc{idx}", 0, len(cost), "END"))
        requests.append(no_border(f"{s}_mc{idx}"))

    # 핵심 KPI
    kpi_a = "3개월 KPI  │  릴스 50만+ 조회  │  팔로워 5,000+  │  가맹 문의 15건+  │  예상 ROI 133~200%"
    requests.append(rect(s, f"{s}_kpi_bg", 0.6, 4.7, 8.8, 0.6, ACCENT_BLUE_BG))
    requests.append(no_border(f"{s}_kpi_bg"))
    requests.append(textbox(s, f"{s}_kpi", 0.8, 4.78, 8.4, 0.4))
    requests.append(insert_text(f"{s}_kpi", kpi_a))
    requests.append(style_text(f"{s}_kpi", 0, len(kpi_a), 10, bold=True, color=BRAND_BLUE))
    requests.append(style_paragraph(f"{s}_kpi", 0, len(kpi_a), "CENTER"))
    requests.append(no_border(f"{s}_kpi"))

    # ─── 슬라이드 4: B안 요약 ───
    s = slides[4]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 2, 0.4))
    requests.append(insert_text(f"{s}_label", "04  B안"))
    requests.append(style_text(f"{s}_label", 0, 6, 11, bold=True, color=BRAND_ORANGE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "브랜드 빌딩 + 바이럴 병행형 ★ 추천"))
    requests.append(style_text(f"{s}_title", 0, 19, 26, bold=True, color=BLACK))
    requests.append(style_text(f"{s}_title", 19, 23, 20, bold=True, color=BRAND_ORANGE))
    requests.append(no_border(f"{s}_title"))

    requests.append(textbox(s, f"{s}_concept", 0.6, 1.3, 8.8, 0.4))
    concept_b = "바이럴로 \"관심\" → 브랜드로 \"신뢰\" → 가맹으로 \"전환\""
    requests.append(insert_text(f"{s}_concept", concept_b))
    requests.append(style_text(f"{s}_concept", 0, len(concept_b), 13, color=BRAND_ORANGE))
    requests.append(no_border(f"{s}_concept"))

    months_b = [
        ("1개월차: 기초 공사", "브랜드 전략 + 톤앤매너\n인스타 리브랜딩 (피드 9장)\n숏폼 3편 + 인플루언서 2명", "500만원"),
        ("2개월차: 콘텐츠 체계화", "콘텐츠 캘린더 (주 3회)\n브랜드 스토리 시리즈\n유튜버 1팀 + 광고 확대", "500만원"),
        ("3개월차: 가맹 전환", "가맹 안내 콘텐츠 + LP 광고\n네이버 SEO 공략 5편\n서울 진출 컨설팅", "500만원"),
    ]
    for idx, (month_title, details, cost) in enumerate(months_b):
        cx = 0.6 + idx * 3.1
        requests.append(rect(s, f"{s}_card{idx}", cx, 1.9, 2.8, 2.6, CARD_BG))
        requests.append(shape_border(f"{s}_card{idx}", BRAND_ORANGE, 1))
        requests.append(textbox(s, f"{s}_mt{idx}", cx + 0.15, 2.0, 2.5, 0.35))
        requests.append(insert_text(f"{s}_mt{idx}", month_title))
        requests.append(style_text(f"{s}_mt{idx}", 0, len(month_title), 11, bold=True, color=BRAND_ORANGE))
        requests.append(no_border(f"{s}_mt{idx}"))
        requests.append(textbox(s, f"{s}_md{idx}", cx + 0.15, 2.4, 2.5, 1.4))
        requests.append(insert_text(f"{s}_md{idx}", details))
        requests.append(style_text(f"{s}_md{idx}", 0, len(details), 10, color=DARK_GRAY))
        requests.append(no_border(f"{s}_md{idx}"))
        requests.append(textbox(s, f"{s}_mc{idx}", cx + 0.15, 3.9, 2.5, 0.35))
        requests.append(insert_text(f"{s}_mc{idx}", cost))
        requests.append(style_text(f"{s}_mc{idx}", 0, len(cost), 14, bold=True, color=BRAND_ORANGE))
        requests.append(style_paragraph(f"{s}_mc{idx}", 0, len(cost), "END"))
        requests.append(no_border(f"{s}_mc{idx}"))

    # B안 핵심 차이점
    diff_b = "핵심 차이  │  계약 종료 후에도 브랜드 자산(가이드라인, 콘텐츠 50개+, 팔로워)이 남습니다"
    requests.append(rect(s, f"{s}_diff_bg", 0.6, 4.7, 8.8, 0.6, {"red": 1.0, "green": 0.97, "blue": 0.93}))
    requests.append(no_border(f"{s}_diff_bg"))
    requests.append(textbox(s, f"{s}_diff", 0.8, 4.78, 8.4, 0.4))
    requests.append(insert_text(f"{s}_diff", diff_b))
    requests.append(style_text(f"{s}_diff", 0, len(diff_b), 10, bold=True, color=BRAND_ORANGE))
    requests.append(style_paragraph(f"{s}_diff", 0, len(diff_b), "CENTER"))
    requests.append(no_border(f"{s}_diff"))

    # ─── 슬라이드 5: A vs B 비교표 ───
    s = slides[5]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 3, 0.4))
    requests.append(insert_text(f"{s}_label", "05  A안 vs B안 비교"))
    requests.append(style_text(f"{s}_label", 0, 13, 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "같은 예산, 다른 전략. 어떤 것이 맞을까요?"))
    requests.append(style_text(f"{s}_title", 0, 22, 26, bold=True, color=BLACK))
    requests.append(no_border(f"{s}_title"))

    # 비교 테이블 (텍스트로 구현)
    compare_rows = [
        ("비교 항목", "A안: 바이럴 집중", "B안: 브랜드+바이럴 ★"),
        ("월 비용", "500만원", "500만원"),
        ("첫 달 임팩트", "★★★★★", "★★★"),
        ("3개월 후 자산", "★★", "★★★★★"),
        ("가맹 문의 속도", "빠름", "중간"),
        ("가맹 전환율", "중간", "높음"),
        ("계약 종료 후", "효과 급감", "자산 유지"),
        ("리스크", "바이럴 실패 시 성과 없음", "바이럴 부진해도 자산 남음"),
    ]

    row_h = 0.4
    start_y = 1.5
    col_widths = [2.4, 3.2, 3.2]
    col_starts = [0.6, 3.0, 6.2]

    for ri, (c1, c2, c3) in enumerate(compare_rows):
        y = start_y + ri * row_h
        is_header = ri == 0
        bg_color = BRAND_NAVY if is_header else (LIGHT_GRAY if ri % 2 == 0 else WHITE)
        text_color = WHITE if is_header else DARK_GRAY

        for ci, (text, cw, cx) in enumerate(zip([c1, c2, c3], col_widths, col_starts)):
            oid = f"{s}_r{ri}c{ci}"
            requests.append(rect(s, f"{oid}_bg", cx, y, cw, row_h, bg_color))
            requests.append(no_border(f"{oid}_bg"))
            requests.append(textbox(s, oid, cx + 0.1, y + 0.05, cw - 0.2, row_h - 0.1))
            requests.append(insert_text(oid, text))
            fs = 10 if is_header else 10
            requests.append(style_text(oid, 0, len(text), fs, bold=is_header, color=text_color))
            if ci > 0:
                requests.append(style_paragraph(oid, 0, len(text), "CENTER"))
            requests.append(no_border(oid))

    # 추천 메시지
    rec_msg = "→ B안 추천: 대표님이 \"500만원 어디에 썼어?\"라고 물으실 때, 숫자 + 자산 둘 다 보여드릴 수 있습니다."
    requests.append(textbox(s, f"{s}_rec", 0.6, 4.9, 8.8, 0.4))
    requests.append(insert_text(f"{s}_rec", rec_msg))
    requests.append(style_text(f"{s}_rec", 0, len(rec_msg), 12, bold=True, color=BRAND_ORANGE))
    requests.append(no_border(f"{s}_rec"))

    # ─── 슬라이드 6: 예상 ROI ───
    s = slides[6]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 2, 0.4))
    requests.append(insert_text(f"{s}_label", "06  예상 ROI"))
    requests.append(style_text(f"{s}_label", 0, 9, 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "가맹 1건이면 마케팅비 2개월분을 회수합니다"))
    requests.append(style_text(f"{s}_title", 0, 23, 26, bold=True, color=BLACK))
    requests.append(no_border(f"{s}_title"))

    # ROI 카드 3개
    roi_cards = [
        ("보수적", "가맹 문의 10~15건\n실제 계약 1~2건\n가맹비 수익 1,000~2,000만원", "ROI 67~133%"),
        ("기대치", "가맹 문의 15~20건\n실제 계약 3건\n가맹비 수익 3,000만원", "ROI 200%"),
        ("낙관적", "가맹 문의 20건+\n실제 계약 4~5건\n가맹비 수익 4,000~5,000만원", "ROI 333%+"),
    ]
    card_colors = [MID_GRAY, BRAND_BLUE, BRAND_ORANGE]

    for idx, ((card_title, details, roi), card_color) in enumerate(zip(roi_cards, card_colors)):
        cx = 0.6 + idx * 3.1
        requests.append(rect(s, f"{s}_roi{idx}", cx, 1.5, 2.8, 2.8, WHITE))
        requests.append(shape_border(f"{s}_roi{idx}", card_color, 2))
        # 제목
        requests.append(textbox(s, f"{s}_rt{idx}", cx + 0.2, 1.6, 2.4, 0.35))
        requests.append(insert_text(f"{s}_rt{idx}", card_title))
        requests.append(style_text(f"{s}_rt{idx}", 0, len(card_title), 13, bold=True, color=card_color))
        requests.append(style_paragraph(f"{s}_rt{idx}", 0, len(card_title), "CENTER"))
        requests.append(no_border(f"{s}_rt{idx}"))
        # 상세
        requests.append(textbox(s, f"{s}_rd{idx}", cx + 0.2, 2.1, 2.4, 1.2))
        requests.append(insert_text(f"{s}_rd{idx}", details))
        requests.append(style_text(f"{s}_rd{idx}", 0, len(details), 10, color=DARK_GRAY))
        requests.append(no_border(f"{s}_rd{idx}"))
        # ROI
        requests.append(textbox(s, f"{s}_rr{idx}", cx + 0.2, 3.4, 2.4, 0.5))
        requests.append(insert_text(f"{s}_rr{idx}", roi))
        requests.append(style_text(f"{s}_rr{idx}", 0, len(roi), 18, bold=True, color=card_color))
        requests.append(style_paragraph(f"{s}_rr{idx}", 0, len(roi), "CENTER"))
        requests.append(no_border(f"{s}_rr{idx}"))

    # 핵심 한마디
    roi_key = "3개월 투자 1,500만원  →  가맹 1건(1,000만원)이면 67% 회수  →  2건이면 100%+ 회수\n마케팅이 아니라 투자입니다."
    requests.append(rect(s, f"{s}_roi_bg", 0.6, 4.5, 8.8, 0.8, BRAND_NAVY))
    requests.append(no_border(f"{s}_roi_bg"))
    requests.append(textbox(s, f"{s}_roi_msg", 0.8, 4.55, 8.4, 0.7))
    requests.append(insert_text(f"{s}_roi_msg", roi_key))
    requests.append(style_text(f"{s}_roi_msg", 0, len(roi_key), 12, bold=True, color=WHITE))
    requests.append(style_paragraph(f"{s}_roi_msg", 0, len(roi_key), "CENTER"))
    requests.append(no_border(f"{s}_roi_msg"))

    # ─── 슬라이드 7: 왜 지금인가 ───
    s = slides[7]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 2, 0.4))
    requests.append(insert_text(f"{s}_label", "07  왜 지금인가"))
    requests.append(style_text(f"{s}_label", 0, 10, 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "3가지 타이밍이 동시에 맞는 순간입니다"))
    requests.append(style_text(f"{s}_title", 0, 20, 26, bold=True, color=BLACK))
    requests.append(no_border(f"{s}_title"))

    reasons = [
        ("① 동동국밥 서울 진출", "서울에서 \"국밥 프랜차이즈\" 하면 어디가 떠오르나요?\n아직 아무도 없습니다.\n동동국밥이 자리 잡기 전에 온라인을 선점해야 합니다.", BRAND_BLUE),
        ("② 홈페이지 3월 오픈", "홈페이지가 생기면 드디어 온라인 마케팅의\n\"도착지\"가 생깁니다.\n광고 → 홈페이지 → 가맹 문의 퍼널이 완성됩니다.", BRAND_BLUE),
        ("③ 돼지우동 바이럴 적기", "숏폼 콘텐츠 전성시대.\n\"국밥집 우동\"이라는 의외성은\n릴스/숏츠에 최적화된 소재입니다.", BRAND_ORANGE),
    ]
    for idx, (title, desc, color) in enumerate(reasons):
        y = 1.5 + idx * 1.1
        requests.append(textbox(s, f"{s}_why_t{idx}", 0.6, y, 3.0, 0.3))
        requests.append(insert_text(f"{s}_why_t{idx}", title))
        requests.append(style_text(f"{s}_why_t{idx}", 0, len(title), 13, bold=True, color=color))
        requests.append(no_border(f"{s}_why_t{idx}"))
        requests.append(textbox(s, f"{s}_why_d{idx}", 3.8, y, 6.0, 0.9))
        requests.append(insert_text(f"{s}_why_d{idx}", desc))
        requests.append(style_text(f"{s}_why_d{idx}", 0, len(desc), 10, color=DARK_GRAY))
        requests.append(no_border(f"{s}_why_d{idx}"))

    # ─── 슬라이드 8: 브랜드라이즈 소개 ───
    s = slides[8]
    requests.append(textbox(s, f"{s}_label", 0.6, 0.3, 3, 0.4))
    requests.append(insert_text(f"{s}_label", "08  브랜드라이즈"))
    requests.append(style_text(f"{s}_label", 0, 10, 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    requests.append(textbox(s, f"{s}_title", 0.6, 0.7, 8.8, 0.6))
    requests.append(insert_text(f"{s}_title", "전략부터 실행까지 한 팀이 책임집니다"))
    requests.append(style_text(f"{s}_title", 0, 19, 26, bold=True, color=BLACK))
    requests.append(no_border(f"{s}_title"))

    services = [
        ("전략 설계", "바이럴 컨셉, 타겟 설정\nKPI 설계, 성과 관리"),
        ("콘텐츠 제작", "숏폼 영상 기획·디렉팅\n인스타 피드·스토리 기획"),
        ("인플루언서", "섭외·협상·가이드라인\n성과 관리·ROI 분석"),
        ("광고 운영", "메타·유튜브 광고\n세팅·최적화·리포팅"),
        ("브랜드 관리", "톤앤매너·비주얼 가이드\n홈페이지 연계·감수"),
        ("월간 리포팅", "성과 보고·전략 조정\n대표님 보고용 요약"),
    ]
    for idx, (svc_title, svc_desc) in enumerate(services):
        row = idx // 3
        col = idx % 3
        cx = 0.6 + col * 3.1
        cy = 1.5 + row * 1.6
        requests.append(rect(s, f"{s}_svc{idx}", cx, cy, 2.8, 1.3, CARD_BG))
        requests.append(no_border(f"{s}_svc{idx}"))
        requests.append(textbox(s, f"{s}_svt{idx}", cx + 0.15, cy + 0.1, 2.5, 0.3))
        requests.append(insert_text(f"{s}_svt{idx}", svc_title))
        requests.append(style_text(f"{s}_svt{idx}", 0, len(svc_title), 12, bold=True, color=BRAND_BLUE))
        requests.append(no_border(f"{s}_svt{idx}"))
        requests.append(textbox(s, f"{s}_svd{idx}", cx + 0.15, cy + 0.45, 2.5, 0.7))
        requests.append(insert_text(f"{s}_svd{idx}", svc_desc))
        requests.append(style_text(f"{s}_svd{idx}", 0, len(svc_desc), 10, color=DARK_GRAY))
        requests.append(no_border(f"{s}_svd{idx}"))

    # 하단
    note = "변미혜 팀장님은 현장 운영과 인플루언서 방문 응대에만 집중하세요.\n온라인 전략과 실행은 저희가 맡겠습니다."
    requests.append(textbox(s, f"{s}_note", 0.6, 4.8, 8.8, 0.6))
    requests.append(insert_text(f"{s}_note", note))
    requests.append(style_text(f"{s}_note", 0, len(note), 11, bold=True, color=BRAND_NAVY))
    requests.append(style_paragraph(f"{s}_note", 0, len(note), "CENTER"))
    requests.append(no_border(f"{s}_note"))

    # ─── 슬라이드 9: Next Step ───
    s = slides[9]
    requests.append(rect(s, f"{s}_bg", 0, 0, 10, 5.625, BRAND_NAVY))
    requests.append(no_border(f"{s}_bg"))

    requests.append(textbox(s, f"{s}_title", 1, 1.0, 8, 0.8))
    requests.append(insert_text(f"{s}_title", "Next Step"))
    requests.append(style_text(f"{s}_title", 0, 9, 36, bold=True, color=WHITE))
    requests.append(style_paragraph(f"{s}_title", 0, 9, "CENTER"))
    requests.append(no_border(f"{s}_title"))

    steps = "① A안 / B안 선택\n\n② 대표님 최종 승인\n\n③ 계약 체결 → 1주일 내 킥오프\n\n④ 1개월차 실행 → 즉시 콘텐츠 제작 시작"
    requests.append(textbox(s, f"{s}_steps", 2.0, 2.0, 6, 2.5))
    requests.append(insert_text(f"{s}_steps", steps))
    requests.append(style_text(f"{s}_steps", 0, len(steps), 16, color=WHITE))
    requests.append(no_border(f"{s}_steps"))

    contact = "브랜드라이즈  |  brandrise.co.kr\n문의: 이메일 또는 카카오톡"
    requests.append(textbox(s, f"{s}_contact", 1, 4.5, 8, 0.8))
    requests.append(insert_text(f"{s}_contact", contact))
    requests.append(style_text(f"{s}_contact", 0, len(contact), 12, color=MID_GRAY))
    requests.append(style_paragraph(f"{s}_contact", 0, len(contact), "CENTER"))
    requests.append(no_border(f"{s}_contact"))

    # ─── 슬라이드 10: 1-page 대표 보고용 요약 ───
    s = slides[10]
    requests.append(textbox(s, f"{s}_label", 0.5, 0.2, 5, 0.3))
    requests.append(insert_text(f"{s}_label", "미례국밥 마케팅 제안 — 핵심 요약 (대표님 보고용)"))
    lbl = "미례국밥 마케팅 제안 — 핵심 요약 (대표님 보고용)"
    requests.append(style_text(f"{s}_label", 0, len(lbl), 11, bold=True, color=BRAND_BLUE))
    requests.append(no_border(f"{s}_label"))

    # 좌측 A안 카드
    requests.append(rect(s, f"{s}_a_card", 0.5, 0.7, 4.2, 3.5, WHITE))
    requests.append(shape_border(f"{s}_a_card", BRAND_BLUE, 2))
    a_title = "A안: 바이럴 집중형"
    requests.append(textbox(s, f"{s}_a_title", 0.7, 0.8, 3.8, 0.35))
    requests.append(insert_text(f"{s}_a_title", a_title))
    requests.append(style_text(f"{s}_a_title", 0, len(a_title), 14, bold=True, color=BRAND_BLUE))
    requests.append(style_paragraph(f"{s}_a_title", 0, len(a_title), "CENTER"))
    requests.append(no_border(f"{s}_a_title"))

    a_body = "월 500만원 × 3개월\n\n• 돼지우동 숏폼 바이럴\n• 인플루언서/유튜버 협업\n• SNS 광고 집중\n\n장점: 빠른 성과, 즉각 임팩트\n단점: 계약 종료 시 효과 감소\n\nROI: 133~200% (보수적)"
    requests.append(textbox(s, f"{s}_a_body", 0.7, 1.2, 3.8, 2.8))
    requests.append(insert_text(f"{s}_a_body", a_body))
    requests.append(style_text(f"{s}_a_body", 0, len(a_body), 10, color=DARK_GRAY))
    requests.append(no_border(f"{s}_a_body"))

    # 우측 B안 카드
    requests.append(rect(s, f"{s}_b_card", 5.3, 0.7, 4.2, 3.5, WHITE))
    requests.append(shape_border(f"{s}_b_card", BRAND_ORANGE, 2))
    b_title = "B안: 브랜드+바이럴 ★추천"
    requests.append(textbox(s, f"{s}_b_title", 5.5, 0.8, 3.8, 0.35))
    requests.append(insert_text(f"{s}_b_title", b_title))
    requests.append(style_text(f"{s}_b_title", 0, len(b_title), 14, bold=True, color=BRAND_ORANGE))
    requests.append(style_paragraph(f"{s}_b_title", 0, len(b_title), "CENTER"))
    requests.append(no_border(f"{s}_b_title"))

    b_body = "월 500만원 × 3개월\n\n• 브랜드 전략 + 톤앤매너 정립\n• 돼지우동 바이럴 (숏폼+광고)\n• 콘텐츠 시스템 구축\n\n장점: 자산 축적, 가맹 전환율 높음\n단점: 첫 달 임팩트 상대적 약함\n\nROI: 200%+ (기대치)"
    requests.append(textbox(s, f"{s}_b_body", 5.5, 1.2, 3.8, 2.8))
    requests.append(insert_text(f"{s}_b_body", b_body))
    requests.append(style_text(f"{s}_b_body", 0, len(b_body), 10, color=DARK_GRAY))
    requests.append(no_border(f"{s}_b_body"))

    # 하단 핵심 메시지
    requests.append(rect(s, f"{s}_bottom", 0.5, 4.4, 9.0, 0.9, BRAND_NAVY))
    requests.append(no_border(f"{s}_bottom"))
    bottom_msg = "가맹 1건 (가맹비 1,000만원) = 마케팅비 2개월분 즉시 회수\n동동국밥 서울 진출 전에 온라인을 선점해야 합니다"
    requests.append(textbox(s, f"{s}_bmsg", 0.7, 4.5, 8.6, 0.7))
    requests.append(insert_text(f"{s}_bmsg", bottom_msg))
    requests.append(style_text(f"{s}_bmsg", 0, len(bottom_msg), 13, bold=True, color=WHITE))
    requests.append(style_paragraph(f"{s}_bmsg", 0, len(bottom_msg), "CENTER"))
    requests.append(no_border(f"{s}_bmsg"))

    return requests


def main():
    service = get_slides_service()

    # 프레젠테이션 생성
    presentation = service.presentations().create(
        body={"title": "미례국밥 마케팅 제안서 — 브랜드라이즈"}
    ).execute()
    pres_id = presentation["presentationId"]
    print(f"프레젠테이션 생성 완료: {pres_id}")

    # 기본 빈 슬라이드 삭제
    default_slide_id = presentation["slides"][0]["objectId"]

    # 슬라이드 사이즈를 16:9로 변경은 create 시점에서만 가능하므로,
    # 기본 4:3으로 진행 (16:9는 Google Slides UI에서 수동 변경 가능)

    # 모든 요소 생성
    requests = build_slide_requests()

    # 기본 슬라이드 삭제 요청을 맨 앞에 추가
    requests.insert(0, {"deleteObject": {"objectId": default_slide_id}})

    # 배치 업데이트 실행
    print(f"총 {len(requests)}개 요청 실행 중...")
    service.presentations().batchUpdate(
        presentationId=pres_id,
        body={"requests": requests}
    ).execute()

    url = f"https://docs.google.com/presentation/d/{pres_id}/edit"
    print(f"\n✅ 완료!")
    print(f"📎 슬라이드 URL: {url}")
    print(f"\n💡 팁: Google Slides에서 파일 > 페이지 설정 > 와이드스크린(16:9)으로 변경하면 더 좋습니다")
    return url


if __name__ == "__main__":
    main()
