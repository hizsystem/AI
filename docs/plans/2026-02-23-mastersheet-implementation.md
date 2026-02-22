# 마스터시트 시스템 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 3팀 프로젝트 관리/재무를 위한 Google Sheets 마스터시트 자동 생성 시스템 구축

**Architecture:** Python + gspread로 Google Sheets API를 호출하여 프로젝트별 마스터시트와 팀 총괄 시트를 자동 생성한다. Service Account 인증을 사용하며, 시트 간 연동은 IMPORTRANGE 수식으로 처리한다.

**Tech Stack:** Python 3.9+, gspread, google-auth, Google Sheets API v4

**설계 문서:** `docs/plans/2026-02-23-mastersheet-design.md`

---

## Task 1: 프로젝트 환경 설정

**Files:**
- Create: `.gitignore`
- Create: `.secrets/` (directory, git-ignored)
- Create: `scripts/requirements.txt`

**Step 1: .gitignore 생성**

`.gitignore` 파일을 프로젝트 루트에 생성:

```
# Secrets
.secrets/
*.json
!package.json

# Python
__pycache__/
*.pyc
.venv/
venv/

# OS
.DS_Store
```

**Step 2: secrets 디렉토리 생성**

```bash
mkdir -p .secrets
```

**Step 3: Python 의존성 파일 생성**

`scripts/requirements.txt`:

```
gspread>=6.0.0
google-auth>=2.28.0
```

**Step 4: 의존성 설치**

Run: `pip3 install -r scripts/requirements.txt`
Expected: Successfully installed gspread, google-auth

**Step 5: 커밋**

```bash
git add .gitignore scripts/requirements.txt
git commit -m "chore: add gitignore and Python dependencies for sheets automation"
```

---

## Task 2: GCP Service Account 설정 (사용자 수동)

> 이 태스크는 사용자가 GCP 콘솔에서 직접 수행해야 합니다.

**Step 1: GCP 프로젝트 생성 (또는 기존 프로젝트 사용)**

1. https://console.cloud.google.com/ 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

**Step 2: Google Sheets API 활성화**

1. GCP 콘솔 > APIs & Services > Library
2. "Google Sheets API" 검색 → Enable
3. "Google Drive API" 검색 → Enable (시트 생성/공유에 필요)

**Step 3: Service Account 생성**

1. GCP 콘솔 > IAM & Admin > Service Accounts
2. "Create Service Account" 클릭
3. 이름: `mastersheet-bot` (또는 원하는 이름)
4. 역할: 없음 (Sheets API는 별도 권한 불필요)
5. "Create Key" > JSON > 다운로드

**Step 4: 키 파일 배치**

다운로드한 JSON 키 파일을 프로젝트에 복사:

```bash
cp ~/Downloads/YOUR_KEY_FILE.json .secrets/gcp-service-account.json
```

**Step 5: 검증 — 인증 테스트**

Run:
```bash
python3 -c "
import gspread
from google.oauth2.service_account import Credentials

scopes = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']
creds = Credentials.from_service_account_file('.secrets/gcp-service-account.json', scopes=scopes)
client = gspread.authorize(creds)
print('AUTH SUCCESS:', client.auth.service_account_email)
"
```

Expected: `AUTH SUCCESS: mastersheet-bot@YOUR_PROJECT.iam.gserviceaccount.com`

---

## Task 3: 프로젝트 마스터시트 생성 스크립트

**Files:**
- Create: `scripts/create_project_sheet.py`

**Step 1: 스크립트 작성**

`scripts/create_project_sheet.py` — 프로젝트 마스터시트 1개를 생성하는 Python 스크립트.

인자:
- `--name`: 프로젝트명 (예: "프로젝트A")
- `--team`: 담당 팀명 (예: "1팀")
- `--share`: 공유할 이메일 주소 (쉼표 구분)

기능:
1. Google Sheets 파일 생성: "[2026] {프로젝트명} 마스터시트"
2. 탭 4개 생성: 종합-요약-색인, 통합 TASK/스케줄, 2026 예상 매출, 2026 예상 지출
3. 각 탭에 헤더 행 + 수식 + 서식 설정
4. 지정 이메일에 편집 권한 공유
5. 생성된 시트 URL 출력

```python
#!/usr/bin/env python3
"""프로젝트 마스터시트 자동 생성 스크립트"""

import argparse
import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
CREDS_PATH = ".secrets/gcp-service-account.json"
MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]


def get_client():
    creds = Credentials.from_service_account_file(CREDS_PATH, scopes=SCOPES)
    return gspread.authorize(creds)


def create_summary_tab(ws):
    """탭 1: 종합-요약-색인"""
    ws.update_title("종합-요약-색인")
    headers = [
        ["[프로젝트 개요]"],
        ["프로젝트명", ""],
        ["클라이언트", ""],
        ["담당팀", ""],
        ["계약기간", ""],
        ["계약금액", ""],
        [""],
        ["[핵심 수치 요약]"],
        ["총 예상매출", "='2026 예상 매출'!P2"],
        ["총 예산(지출)", "='2026 예상 지출'!P2"],
        ["수익률", "=IF(B9=0,0,(B9-B10)/B9)"],
        [""],
        ["[진행 상태]"],
        ["전체 TASK", "=COUNTA('통합 TASK-스케줄'!A3:A)"],
        ["완료", "=COUNTIF('통합 TASK-스케줄'!G3:G,\"완료\")"],
        ["진행중", "=COUNTIF('통합 TASK-스케줄'!G3:G,\"진행중\")"],
        ["미착수", "=COUNTIF('통합 TASK-스케줄'!G3:G,\"미착수\")"],
        ["진행률", "=IF(B14=0,0,B15/B14)"],
        [""],
        ["[시트 색인]"],
        ["종합-요약-색인", "이 탭"],
        ["통합 TASK/스케줄", "TASK 및 일정 관리"],
        ["2026 예상 매출", "세금계산서 기준 월별 매출"],
        ["2026 예상 지출", "카테고리별 월별 지출"],
    ]
    ws.update("A1", headers)
    ws.format("A1", {"textFormat": {"bold": True}})
    ws.format("A8", {"textFormat": {"bold": True}})
    ws.format("A13", {"textFormat": {"bold": True}})
    ws.format("A20", {"textFormat": {"bold": True}})


def create_task_tab(sh):
    """탭 2: 통합 TASK / 스케줄"""
    ws = sh.add_worksheet(title="통합 TASK-스케줄", rows=200, cols=9)
    headers = [["TASK ID", "카테고리", "TASK명", "담당자", "시작일", "마감일", "상태", "우선순위", "비고"]]
    ws.update("A1", headers)
    ws.format("A1:I1", {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.2, "green": 0.4, "blue": 0.7},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })
    # 상태 드롭다운용 데이터 유효성 검사는 API v4에서 별도 처리 필요
    return ws


def create_revenue_tab(sh):
    """탭 3: 2026 예상 매출"""
    ws = sh.add_worksheet(title="2026 예상 매출", rows=50, cols=17)
    row1 = ["항목", "세금계산서 발행일", "공급가", "VAT포함"] + MONTHS + ["연간합계"]
    ws.update("A1", [row1])
    # 합계 행 (행 2: 월별 합계)
    sum_row = ["[월별 합계]", "", "=SUM(C3:C50)", "=SUM(D3:D50)"]
    for col_idx in range(5, 17):  # E~P (1월~12월)
        col_letter = chr(64 + col_idx)
        sum_row.append(f"=SUM({col_letter}3:{col_letter}50)")
    sum_row.append("=SUM(E2:P2)")  # 연간합계 = 월별합계의 합
    ws.update("A2", [sum_row])
    ws.format("A1:Q1", {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.15, "green": 0.5, "blue": 0.3},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })
    ws.format("A2:Q2", {"textFormat": {"bold": True}})
    return ws


def create_expense_tab(sh):
    """탭 4: 2026 예상 지출"""
    ws = sh.add_worksheet(title="2026 예상 지출", rows=80, cols=16)
    row1 = ["카테고리", "항목", "단가", "수량"] + MONTHS
    ws.update("A1", [row1])
    # 카테고리별 섹션 헤더 + 소계 행
    categories = ["인건비", "외주비", "광고비", "툴비용", "기타"]
    current_row = 3
    category_rows = {}
    for cat in categories:
        ws.update(f"A{current_row}", [[f"[{cat}]"]])
        ws.format(f"A{current_row}", {"textFormat": {"bold": True}})
        category_rows[cat] = current_row
        current_row += 6  # 카테고리당 5행 여유 + 소계
        # 소계 행
        sum_row = [f"{cat} 소계", ""]
        for col_idx in range(3, 15):  # C~N (단가~12월은 E~P)
            col_letter = chr(64 + col_idx + 2)  # E부터
            sum_row.append(f"=SUM({col_letter}{category_rows[cat]+1}:{col_letter}{current_row-2})")
        ws.update(f"A{current_row-1}", [sum_row[:2]])

    # 월별 총합계 행 (행 2)
    sum_row2 = ["[월별 합계]", "", "", ""]
    for col_idx in range(5, 17):  # E~P
        col_letter = chr(64 + col_idx)
        sum_row2.append(f"=SUM({col_letter}3:{col_letter}50)")
    ws.update("A2", [sum_row2])
    ws.format("A2:P2", {"textFormat": {"bold": True}})

    ws.format("A1:P1", {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.7, "green": 0.2, "blue": 0.2},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })
    return ws


def create_project_sheet(name, team, share_emails=None):
    client = get_client()
    title = f"[2026] {name} 마스터시트"

    # 스프레드시트 생성
    sh = client.create(title)
    print(f"Created: {title}")
    print(f"URL: {sh.url}")

    # 탭 1: 종합-요약-색인 (기본 Sheet1 활용)
    ws_summary = sh.sheet1
    create_summary_tab(ws_summary)
    ws_summary.update("B2", [[name]])
    ws_summary.update("B4", [[team]])

    # 탭 2: 통합 TASK/스케줄
    create_task_tab(sh)

    # 탭 3: 2026 예상 매출
    create_revenue_tab(sh)

    # 탭 4: 2026 예상 지출
    create_expense_tab(sh)

    # 공유
    if share_emails:
        for email in share_emails:
            sh.share(email.strip(), perm_type="user", role="writer")
            print(f"Shared with: {email.strip()}")

    return sh


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="프로젝트 마스터시트 생성")
    parser.add_argument("--name", required=True, help="프로젝트명")
    parser.add_argument("--team", required=True, help="담당 팀명")
    parser.add_argument("--share", help="공유 이메일 (쉼표 구분)")
    args = parser.parse_args()

    emails = args.share.split(",") if args.share else None
    create_project_sheet(args.name, args.team, emails)
```

**Step 2: 실행 테스트**

Run:
```bash
python3 scripts/create_project_sheet.py --name "테스트 프로젝트" --team "1팀" --share "YOUR_EMAIL@gmail.com"
```

Expected:
```
Created: [2026] 테스트 프로젝트 마스터시트
URL: https://docs.google.com/spreadsheets/d/XXXXX
Shared with: YOUR_EMAIL@gmail.com
```

**Step 3: 시트 열어서 구조 확인**

URL을 열어 4개 탭, 헤더, 수식이 올바른지 확인

**Step 4: 커밋**

```bash
git add scripts/create_project_sheet.py
git commit -m "feat: add project mastersheet auto-generation script"
```

---

## Task 4: 팀 총괄 마스터시트 생성 스크립트

**Files:**
- Create: `scripts/create_team_summary_sheet.py`

**Step 1: 스크립트 작성**

`scripts/create_team_summary_sheet.py` — 팀 총괄 마스터시트를 생성하는 스크립트.

인자:
- `--share`: 공유 이메일

기능:
1. "[2026] 팀 총괄 마스터시트" 생성
2. 탭 4개: 대시보드, 프로젝트별 월별 총지출, 팀 전체 월별 총지출, 월별 수익
3. 헤더 + 구조 + 서식 설정

```python
#!/usr/bin/env python3
"""팀 총괄 마스터시트 자동 생성 스크립트"""

import argparse
import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
CREDS_PATH = ".secrets/gcp-service-account.json"
MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"]
TEAMS = ["1팀", "2팀", "3팀"]


def get_client():
    creds = Credentials.from_service_account_file(CREDS_PATH, scopes=SCOPES)
    return gspread.authorize(creds)


def create_dashboard_tab(ws):
    """탭 1: 대시보드"""
    ws.update_title("대시보드")
    rows = [
        ["[팀별 프로젝트 현황]"],
        ["팀", "프로젝트 수", "진행중", "완료"],
        ["1팀", "", "", ""],
        ["2팀", "", "", ""],
        ["3팀", "", "", ""],
        [""],
        ["[월별 수익 요약]"],
        ["", ] + MONTHS + ["연간합계"],
        ["총 매출"] + [""] * 13,
        ["총 지출"] + [""] * 13,
        ["수익"] + [""] * 13,
        [""],
        ["[연간 누적 수익]"],
        ["누적"] + [""] * 12,
    ]
    ws.update("A1", rows)
    ws.format("A1", {"textFormat": {"bold": True}})
    ws.format("A7", {"textFormat": {"bold": True}})
    ws.format("A13", {"textFormat": {"bold": True}})
    ws.format("A8:N8", {"textFormat": {"bold": True}})


def create_project_expense_tab(sh):
    """탭 2: 프로젝트별 월별 총지출"""
    ws = sh.add_worksheet(title="프로젝트별 월별 총지출", rows=50, cols=15)
    header = ["팀", "프로젝트"] + MONTHS + ["연간합계"]
    ws.update("A1", [header])
    ws.format("A1:O1", {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.7, "green": 0.2, "blue": 0.2},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })

    # 팀별 섹션 (각 팀 5행 여유 + 소계)
    current_row = 2
    for team in TEAMS:
        ws.update(f"A{current_row}", [[team, "(프로젝트 추가)"]])
        current_row += 5
        # 팀 소계 행
        ws.update(f"A{current_row}", [[f"{team} 소계", ""]])
        ws.format(f"A{current_row}:O{current_row}", {"textFormat": {"bold": True}})
        current_row += 1

    # 전체 합계
    ws.update(f"A{current_row}", [["전체 합계", ""]])
    ws.format(f"A{current_row}:O{current_row}", {"textFormat": {"bold": True}})
    return ws


def create_team_total_expense_tab(sh):
    """탭 3: 팀 전체 월별 총지출"""
    ws = sh.add_worksheet(title="팀 전체 월별 총지출", rows=20, cols=15)
    header = ["카테고리"] + MONTHS + ["연간합계", "비율"]
    ws.update("A1", [header])
    ws.format("A1:O1", {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.2, "green": 0.4, "blue": 0.7},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })

    categories = ["인건비", "외주비", "광고비", "툴비용", "기타"]
    for i, cat in enumerate(categories):
        ws.update(f"A{i+2}", [[cat]])

    total_row = len(categories) + 2
    ws.update(f"A{total_row}", [["전체 합계"]])
    ws.format(f"A{total_row}:O{total_row}", {"textFormat": {"bold": True}})
    return ws


def create_profit_tab(sh):
    """탭 4: 예상 매출 vs 지출 — 월별 수익"""
    ws = sh.add_worksheet(title="월별 수익", rows=50, cols=15)
    header = ["팀", "프로젝트"] + MONTHS + ["연간합계"]
    ws.update("A1", [header])
    ws.format("A1:O1", {
        "textFormat": {"bold": True},
        "backgroundColor": {"red": 0.15, "green": 0.5, "blue": 0.3},
        "textFormat": {"bold": True, "foregroundColor": {"red": 1, "green": 1, "blue": 1}},
    })

    # 구조: 매출 섹션 → 지출 섹션 → 수익 섹션
    sections = [
        ("[예상 매출]", 3),
        ("[예상 지출]", 15),
        ("[수익 (매출-지출)]", 27),
    ]
    for section_name, start_row in sections:
        ws.update(f"A{start_row}", [[section_name]])
        ws.format(f"A{start_row}", {"textFormat": {"bold": True}})

        current = start_row + 1
        for team in TEAMS:
            ws.update(f"A{current}", [[team, "(프로젝트)"]])
            current += 3
            ws.update(f"A{current}", [[f"{team} 소계", ""]])
            ws.format(f"A{current}:O{current}", {"textFormat": {"bold": True}})
            current += 1

        ws.update(f"A{current}", [["전체 합계", ""]])
        ws.format(f"A{current}:O{current}", {"textFormat": {"bold": True}})

    # 누적 수익 행
    ws.update("A40", [["[누적 수익]"]])
    ws.format("A40", {"textFormat": {"bold": True}})
    ws.update("A41", [["누적", ""]])
    return ws


def create_team_summary_sheet(share_emails=None):
    client = get_client()
    title = "[2026] 팀 총괄 마스터시트"

    sh = client.create(title)
    print(f"Created: {title}")
    print(f"URL: {sh.url}")

    # 탭 1: 대시보드 (기본 Sheet1)
    create_dashboard_tab(sh.sheet1)

    # 탭 2: 프로젝트별 월별 총지출
    create_project_expense_tab(sh)

    # 탭 3: 팀 전체 월별 총지출
    create_team_total_expense_tab(sh)

    # 탭 4: 월별 수익
    create_profit_tab(sh)

    # 공유
    if share_emails:
        for email in share_emails:
            sh.share(email.strip(), perm_type="user", role="writer")
            print(f"Shared with: {email.strip()}")

    return sh


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="팀 총괄 마스터시트 생성")
    parser.add_argument("--share", help="공유 이메일 (쉼표 구분)")
    args = parser.parse_args()

    emails = args.share.split(",") if args.share else None
    create_team_summary_sheet(emails)
```

**Step 2: 실행 테스트**

Run:
```bash
python3 scripts/create_team_summary_sheet.py --share "YOUR_EMAIL@gmail.com"
```

Expected:
```
Created: [2026] 팀 총괄 마스터시트
URL: https://docs.google.com/spreadsheets/d/XXXXX
Shared with: YOUR_EMAIL@gmail.com
```

**Step 3: 시트 열어서 4개 탭 구조 확인**

**Step 4: 커밋**

```bash
git add scripts/create_team_summary_sheet.py
git commit -m "feat: add team summary mastersheet auto-generation script"
```

---

## Task 5: IMPORTRANGE 연동 스크립트

**Files:**
- Create: `scripts/link_sheets.py`

**Step 1: 스크립트 작성**

프로젝트 시트의 매출/지출 합계를 팀 총괄 시트에 IMPORTRANGE 수식으로 연결하는 스크립트.

```python
#!/usr/bin/env python3
"""프로젝트 시트 → 팀 총괄 시트 IMPORTRANGE 연동"""

import argparse
import gspread
from google.oauth2.service_account import Credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
CREDS_PATH = ".secrets/gcp-service-account.json"


def get_client():
    creds = Credentials.from_service_account_file(CREDS_PATH, scopes=SCOPES)
    return gspread.authorize(creds)


def link_project_to_summary(project_sheet_url, summary_sheet_url, team, row_num):
    """프로젝트 시트의 합계를 총괄 시트에 IMPORTRANGE로 연결"""
    client = get_client()

    project_sh = client.open_by_url(project_sheet_url)
    summary_sh = client.open_by_url(summary_sheet_url)

    project_id = project_sh.id
    project_name = project_sh.title.replace("[2026] ", "").replace(" 마스터시트", "")

    # 탭 2: 프로젝트별 월별 총지출에 행 추가
    ws_expense = summary_sh.worksheet("프로젝트별 월별 총지출")
    ws_expense.update(f"A{row_num}", [[team, project_name]])

    # IMPORTRANGE로 지출 월별 합계 연결 (프로젝트 시트 "2026 예상 지출" 탭의 행 2, E~P열)
    for col_idx, month_col in enumerate(range(3, 15)):  # C~N in summary = E~P in project
        summary_col = chr(64 + month_col)  # C, D, E...
        project_col = chr(69 + col_idx)  # E, F, G...
        formula = f'=IMPORTRANGE("{project_id}", "2026 예상 지출!{project_col}2")'
        ws_expense.update(f"{summary_col}{row_num}", [[formula]], value_input_option="USER_ENTERED")

    # 탭 4: 월별 수익에도 매출/지출 연결
    ws_profit = summary_sh.worksheet("월별 수익")
    # (매출 섹션과 지출 섹션에 각각 IMPORTRANGE 추가)

    print(f"Linked: {project_name} ({team}) → row {row_num}")
    print(f"NOTE: 총괄 시트에서 IMPORTRANGE 액세스 허용 팝업을 클릭해주세요.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="프로젝트-총괄 시트 연동")
    parser.add_argument("--project-url", required=True, help="프로젝트 시트 URL")
    parser.add_argument("--summary-url", required=True, help="총괄 시트 URL")
    parser.add_argument("--team", required=True, help="팀명")
    parser.add_argument("--row", type=int, required=True, help="총괄 시트에서의 행 번호")
    args = parser.parse_args()

    link_project_to_summary(args.project_url, args.summary_url, args.team, args.row)
```

**Step 2: 커밋**

```bash
git add scripts/link_sheets.py
git commit -m "feat: add IMPORTRANGE linking script for sheet-to-sheet sync"
```

---

## Task 6: 전체 통합 테스트

**Step 1: 테스트 프로젝트 시트 생성**

```bash
python3 scripts/create_project_sheet.py --name "테스트A" --team "1팀" --share "YOUR_EMAIL"
```

**Step 2: 팀 총괄 시트 생성**

```bash
python3 scripts/create_team_summary_sheet.py --share "YOUR_EMAIL"
```

**Step 3: 연동 테스트**

```bash
python3 scripts/link_sheets.py \
  --project-url "STEP1에서_나온_URL" \
  --summary-url "STEP2에서_나온_URL" \
  --team "1팀" \
  --row 2
```

**Step 4: 수동 검증**

1. 프로젝트 시트 "2026 예상 지출" 탭에 테스트 데이터 입력
2. 팀 총괄 시트에서 IMPORTRANGE 액세스 허용
3. 총괄 시트에 데이터가 자동 반영되는지 확인

**Step 5: 테스트 시트 삭제 (선택)**

검증 완료 후 테스트용 시트 삭제

---

## Task 7: 실제 프로젝트 시트 생성 + 회계팀 데이터 입력

> 프로젝트가 확정되면 실행

**Step 1: 프로젝트별 마스터시트 생성**

각 프로젝트마다 실행:
```bash
python3 scripts/create_project_sheet.py --name "프로젝트명" --team "N팀" --share "팀이메일"
```

**Step 2: 팀 총괄 시트와 연동**

각 프로젝트마다:
```bash
python3 scripts/link_sheets.py --project-url "URL" --summary-url "총괄URL" --team "N팀" --row N
```

**Step 3: 매출/지출 데이터 입력**

각 프로젝트 시트에:
- "2026 예상 매출" 탭: 계약서 기준 세금계산서 발행 시점/금액
- "2026 예상 지출" 탭: 카테고리별 월별 예상 지출

**Step 4: 총괄 시트 검증**

- 프로젝트별 월별 총지출 자동 집계 확인
- 팀 전체 월별 총지출 확인
- 예상 매출 vs 지출 수익 확인

**Step 5: 회계팀에 총괄 시트 URL 공유**
