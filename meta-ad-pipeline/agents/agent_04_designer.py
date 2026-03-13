"""
Agent 4: 디자인 에이전트
카피에 맞는 비주얼 가이드를 설계한다.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
import gemini_client


def run() -> dict:
    print("[Agent 4] 디자인 시작...")

    system_prompt = gemini_client.load_prompt(4)
    research = gemini_client.load_output("02_research.json")
    copy = gemini_client.load_output("03_copy.json")

    user_prompt = f"""
아래 카피와 리서치를 기반으로 13개 이미지의 비주얼 가이드를 설계해주세요.

## 크리에이티브 전략
{json.dumps(research, ensure_ascii=False, indent=2)}

## 카피 세트
{json.dumps(copy, ensure_ascii=False, indent=2)}

## 요청 사항
1. global_style (컬러 팔레트, 타이포그래피, 브랜드 요소)
2. 카드뉴스 10장 각각의 레이아웃, 배경, 텍스트 배치, 비주얼 요소
3. 싱글 이미지 2장의 디자인 스펙
4. 썸네일 1장의 디자인 스펙
5. 각 슬라이드의 CTA 바 설정

레퍼런스 디자인 패턴(Type A/B/C)을 반드시 참고하세요.
출력 형식에 맞는 JSON을 생성해주세요.
"""

    result_text = gemini_client.generate_text(
        prompt=user_prompt,
        system_prompt=system_prompt,
    )

    result = json.loads(result_text)
    gemini_client.save_output("04_design.json", result)
    print("[Agent 4] 디자인 완료!")
    return result


if __name__ == "__main__":
    run()
