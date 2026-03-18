"""
Agent 2: 리서치 에이전트
경쟁사 광고를 분석하고 크리에이티브 전략을 수립한다.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
import gemini_client


def run() -> dict:
    print("[Agent 2] 리서치 시작...")

    # 시스템 프롬프트 로드
    system_prompt = gemini_client.load_prompt(2)

    # 이전 에이전트 산출물 로드
    product_info = gemini_client.load_output("01_product_info.json")

    user_prompt = f"""
아래 제품/서비스 정보를 기반으로 메타 광고 크리에이티브 전략을 수립해주세요.

## 제품/서비스 정보 (Agent 1 산출물)
{json.dumps(product_info, ensure_ascii=False, indent=2)}

## 요청 사항
1. 15개 참조 계정의 광고 패턴을 분석하세요
2. 최소 5개의 훅 앵글을 도출하세요 (priority 순위 포함)
3. 전환 장치를 설계하세요
4. 통합 크리에이티브 전략을 제시하세요

출력 형식에 맞는 JSON을 생성해주세요.
"""

    result_text = gemini_client.generate_text(
        prompt=user_prompt,
        system_prompt=system_prompt,
    )

    result = json.loads(result_text)
    gemini_client.save_output("02_research.json", result)
    print("[Agent 2] 리서치 완료!")
    return result


if __name__ == "__main__":
    run()
