"""
Agent 3: 카피라이팅 에이전트
카드뉴스 10장 + 싱글 2장 + 썸네일 1장의 카피를 작성한다.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
import gemini_client


def run() -> dict:
    print("[Agent 3] 카피라이팅 시작...")

    system_prompt = gemini_client.load_prompt(3)
    product_info = gemini_client.load_output("01_product_info.json")
    research = gemini_client.load_output("02_research.json")

    user_prompt = f"""
아래 정보를 기반으로 메타 광고 카피 세트를 작성해주세요.

## 제품 정보
{json.dumps(product_info, ensure_ascii=False, indent=2)}

## 크리에이티브 전략
{json.dumps(research, ensure_ascii=False, indent=2)}

## 요청 사항
1. 카드뉴스 10장 카피 (표지~CTA 구조)
2. 싱글 이미지 2개 카피 (문제-해결형 + 권위-신뢰형)
3. 썸네일 1개 카피 (세로형, 큰 텍스트)
4. 인스타그램 캡션 + 해시태그

각 슬라이드의 highlight_words를 반드시 포함하세요.
출력 형식에 맞는 JSON을 생성해주세요.
"""

    result_text = gemini_client.generate_text(
        prompt=user_prompt,
        system_prompt=system_prompt,
    )

    result = json.loads(result_text)
    gemini_client.save_output("03_copy.json", result)
    print("[Agent 3] 카피라이팅 완료!")
    return result


if __name__ == "__main__":
    run()
