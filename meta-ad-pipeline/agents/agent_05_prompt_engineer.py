"""
Agent 5: 프롬프팅 에이전트
카피 + 디자인을 통합하여 AI 이미지 생성 프롬프트를 작성한다.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
import gemini_client


def run() -> dict:
    print("[Agent 5] 프롬프팅 시작...")

    system_prompt = gemini_client.load_prompt(5)
    copy = gemini_client.load_output("03_copy.json")
    design = gemini_client.load_output("04_design.json")

    user_prompt = f"""
아래 카피와 디자인 스펙을 통합하여, Gemini Imagen이 이미지를 생성할 수 있는 프롬프트 13개를 작성해주세요.

## 카피 세트
{json.dumps(copy, ensure_ascii=False, indent=2)}

## 디자인 스펙
{json.dumps(design, ensure_ascii=False, indent=2)}

## 요청 사항
1. 카드뉴스 10장 (carousel_01~10) 프롬프트
2. 싱글 이미지 2장 (single_01~02) 프롬프트
3. 썸네일 1장 (thumbnail) 프롬프트
4. 각 프롬프트에 negative_prompt 포함
5. generation_config 포함

각 프롬프트는 400자 이상으로 상세하게 작성하세요.
한글 텍스트는 정확히 카피에서 복사하세요.
출력 형식에 맞는 JSON을 생성해주세요.
"""

    result_text = gemini_client.generate_text(
        prompt=user_prompt,
        system_prompt=system_prompt,
    )

    result = json.loads(result_text)
    gemini_client.save_output("05_prompts.json", result)
    print("[Agent 5] 프롬프팅 완료!")
    return result


if __name__ == "__main__":
    run()
