"""Google Sheets 인증 공통 모듈"""

import json
import gspread
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
OAUTH_CREDS_PATH = ".secrets/oauth-credentials.json"
TOKEN_PATH = ".secrets/token.json"
MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]


def get_client():
    """인증된 gspread 클라이언트 반환. 저장된 토큰 우선 사용."""
    try:
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
        # 토큰 갱신 시 저장
        if creds.token != token_data["token"]:
            token_data["token"] = creds.token
            with open(TOKEN_PATH, "w") as f:
                json.dump(token_data, f)
        return client
    except (FileNotFoundError, KeyError):
        # 토큰 없으면 새로 로그인
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
        return gspread.authorize(creds)
