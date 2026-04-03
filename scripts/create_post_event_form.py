#!/usr/bin/env python3
"""고벤처포럼 사후 설문 구글폼 자동 생성"""

import json
import warnings
warnings.filterwarnings("ignore")

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/forms.body",
]
OAUTH_CREDS_PATH = ".secrets/oauth-credentials.json"
TOKEN_PATH = ".secrets/token.json"


def get_credentials():
    """forms.body 스코프 포함된 인증 반환"""
    try:
        with open(TOKEN_PATH) as f:
            token_data = json.load(f)
        existing_scopes = set(token_data.get("scopes", []))
        needed_scopes = set(SCOPES)
        if needed_scopes.issubset(existing_scopes):
            return Credentials(
                token=token_data["token"],
                refresh_token=token_data["refresh_token"],
                token_uri=token_data["token_uri"],
                client_id=token_data["client_id"],
                client_secret=token_data["client_secret"],
                scopes=token_data["scopes"],
            )
        else:
            print("Forms API 스코프 추가 필요 → 브라우저 인증 진행...")
    except FileNotFoundError:
        print("토큰 없음 → 브라우저 인증 진행...")

    flow = InstalledAppFlow.from_client_secrets_file(OAUTH_CREDS_PATH, SCOPES)
    creds = flow.run_local_server(port=0)
    token_data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes),
    }
    with open(TOKEN_PATH, "w") as f:
        json.dump(token_data, f)
    print("인증 완료, 토큰 저장됨")
    return creds


def create_form(creds):
    service = build("forms", "v1", credentials=creds)

    # 1. 빈 폼 생성
    form = service.forms().create(body={
        "info": {
            "title": "제189회 고벤처포럼에 참석해 주셔서 감사합니다",
            "documentTitle": "제189회 고벤처포럼 사후 설문",
        }
    }).execute()

    form_id = form["formId"]
    print(f"폼 생성 완료: https://docs.google.com/forms/d/{form_id}/edit")

    # 2. 설명 + 문항 추가
    requests = []
    idx = 0

    # 폼 설명 업데이트
    requests.append({
        "updateFormInfo": {
            "info": {
                "description": (
                    "안녕하세요, 고벤처포럼 운영팀입니다.\n\n"
                    "지난 3월 31일, 제189회 고벤처포럼에 참석해 주셔서 진심으로 감사드립니다.\n"
                    "더 나은 포럼을 만들기 위해 간단한 피드백을 부탁드립니다. (약 1분 소요)"
                ),
            },
            "updateMask": "description",
        }
    })

    # === 섹션 1: 행사 만족도 ===

    # Q1. 전반적인 행사 만족도
    requests.append({
        "createItem": {
            "item": {
                "title": "전반적인 행사 만족도는 어떠셨나요?",
                "questionItem": {
                    "question": {
                        "required": True,
                        "scaleQuestion": {
                            "low": 1,
                            "high": 5,
                            "lowLabel": "매우 불만족",
                            "highLabel": "매우 만족",
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # Q2. 가장 좋았던 점 (복수 선택)
    requests.append({
        "createItem": {
            "item": {
                "title": "가장 좋았던 점은 무엇인가요? (복수 선택 가능)",
                "questionItem": {
                    "question": {
                        "required": False,
                        "choiceQuestion": {
                            "type": "CHECKBOX",
                            "options": [
                                {"value": "네트워킹 기회"},
                                {"value": "IR 피칭 세션"},
                                {"value": "1:1 상담"},
                                {"value": "행사 분위기/공간"},
                                {"value": "케이터링 (샌드위치/음료)"},
                                {"value": "참석자 구성 (VC, 창업자, 기관 등)"},
                                {"isOther": True},
                            ]
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # Q3. 아쉬운 점
    requests.append({
        "createItem": {
            "item": {
                "title": "아쉬웠거나 개선이 필요한 점이 있다면 자유롭게 적어주세요.",
                "questionItem": {
                    "question": {
                        "required": False,
                        "textQuestion": {
                            "paragraph": True,
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # === 섹션 2: 1:1 상담 피드백 ===

    # Q4. 1:1 상담 참여 여부
    requests.append({
        "createItem": {
            "item": {
                "title": "1:1 상담에 참여하셨나요?",
                "questionItem": {
                    "question": {
                        "required": True,
                        "choiceQuestion": {
                            "type": "RADIO",
                            "options": [
                                {"value": "네, 참여했습니다"},
                                {"value": "아니요, 참여하지 않았습니다"},
                                {"value": "시간이 부족해서 못했습니다"},
                            ]
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # Q4-1. 상담 만족도 (참여한 경우)
    requests.append({
        "createItem": {
            "item": {
                "title": "(상담 참여한 경우) 상담 만족도는 어떠셨나요?",
                "questionItem": {
                    "question": {
                        "required": False,
                        "scaleQuestion": {
                            "low": 1,
                            "high": 5,
                            "lowLabel": "매우 불만족",
                            "highLabel": "매우 만족",
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # Q4-2. 별도 상담 희망 (못한 경우)
    requests.append({
        "createItem": {
            "item": {
                "title": "(상담 못한 경우) 별도 일정으로 상담을 원하시나요?",
                "questionItem": {
                    "question": {
                        "required": False,
                        "choiceQuestion": {
                            "type": "RADIO",
                            "options": [
                                {"value": "네, 별도 일정 잡고 싶습니다"},
                                {"value": "아니요, 괜찮습니다"},
                            ]
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # === 섹션 3: 다음 포럼 ===

    # Q5. 다음 포럼 참석 의향
    requests.append({
        "createItem": {
            "item": {
                "title": "다음 고벤처포럼에도 참석 의향이 있으시나요?",
                "questionItem": {
                    "question": {
                        "required": True,
                        "choiceQuestion": {
                            "type": "RADIO",
                            "options": [
                                {"value": "꼭 참석하겠습니다"},
                                {"value": "일정 맞으면 참석하겠습니다"},
                                {"value": "아직 모르겠습니다"},
                            ]
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # Q6. 희망 주제
    requests.append({
        "createItem": {
            "item": {
                "title": "다음 포럼에서 다뤘으면 하는 주제나 형식이 있나요?",
                "description": "예) 특정 업종 IR, 투자 트렌드, 정부지원사업 안내, 실무 워크숍 등",
                "questionItem": {
                    "question": {
                        "required": False,
                        "textQuestion": {
                            "paragraph": True,
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })
    idx += 1

    # Q7. 뉴스레터 구독
    requests.append({
        "createItem": {
            "item": {
                "title": "고벤처포럼 뉴스레터 구독을 원하시나요?",
                "description": "월 1~2회, 스타트업 투자/네트워킹 소식을 전달드립니다.",
                "questionItem": {
                    "question": {
                        "required": True,
                        "choiceQuestion": {
                            "type": "RADIO",
                            "options": [
                                {"value": "네, 구독하겠습니다"},
                                {"value": "아니요, 괜찮습니다"},
                            ]
                        }
                    }
                }
            },
            "location": {"index": idx}
        }
    })

    # 일괄 업데이트
    service.forms().batchUpdate(
        formId=form_id,
        body={"requests": requests}
    ).execute()

    print(f"\n✅ 폼 생성 완료!")
    print(f"   편집: https://docs.google.com/forms/d/{form_id}/edit")
    print(f"   응답: https://docs.google.com/forms/d/{form_id}/viewform")
    return form_id


if __name__ == "__main__":
    creds = get_credentials()
    create_form(creds)
