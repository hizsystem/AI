#!/bin/bash
# Meta Ad Pipeline - 에이전트 실행 스크립트
#
# 사용법:
#   ./run_agent.sh                    # 전체 파이프라인 실행
#   ./run_agent.sh --from 3           # Agent 3부터 실행
#   ./run_agent.sh --only 5           # Agent 5만 실행
#   ./run_agent.sh --generate-images  # 이미지 생성만
#   ./run_agent.sh --full             # 파이프라인 + 이미지 생성

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# API 키 확인
if [ -z "$GEMINI_API_KEY" ]; then
    echo "오류: GEMINI_API_KEY 환경변수가 설정되지 않았습니다."
    echo "설정: export GEMINI_API_KEY=your_key"
    exit 1
fi

# Python 확인
if ! command -v python3 &> /dev/null; then
    echo "오류: python3가 설치되어 있지 않습니다."
    exit 1
fi

# 의존성 확인
python3 -c "from google import genai" 2>/dev/null || {
    echo "google-genai 패키지를 설치합니다..."
    pip install google-genai
}

# 실행
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  datarise Meta Ad Pipeline"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 main.py "$@"
