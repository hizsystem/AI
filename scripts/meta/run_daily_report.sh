#!/bin/bash
# Meta 광고 데일리 리포트 — launchd에서 호출
# 매일 오전 9시 실행 → Slack으로 발송

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PYTHON="$SCRIPT_DIR/.venv/bin/python"
ENV_FILE="$SCRIPT_DIR/../../.env"

# 환경변수 로드
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# 리포트 실행
cd "$SCRIPT_DIR/.."
"$VENV_PYTHON" -m meta.daily_reporter --account brandrise

echo "[$(date)] 데일리 리포트 완료" >> "$SCRIPT_DIR/../../logs/daily_report.log"
