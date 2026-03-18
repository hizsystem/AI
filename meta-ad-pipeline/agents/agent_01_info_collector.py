"""
Agent 1: 정보수집 에이전트
세일즈 플랜 + 컨텍스트에서 광고 소재 제작에 필요한 정보를 추출한다.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import gemini_client


def run() -> dict:
    print("[Agent 1] 정보수집 시작...")

    # 시스템 프롬프트 로드
    system_prompt = gemini_client.load_prompt(1)

    # 컨텍스트 (세일즈 플랜 등) 로드
    context = gemini_client.load_context()

    # config에서 타겟 정보 로드
    config = gemini_client.load_config()
    target_info = config.get("target", {})

    user_prompt = f"""
아래 컨텍스트 문서를 분석하여, 메타 광고 소재 제작에 필요한 정보를 JSON으로 정리해주세요.

## 타겟 설정 (config.json)
- 페르소나: {target_info.get('persona', '')}
- 페인 포인트: {', '.join(target_info.get('pain_points', []))}
- 브랜드 톤: {target_info.get('brand_tone', '')}
- 핵심 메시지: {target_info.get('core_message', '')}
- USP: {target_info.get('usp', '')}

## 컨텍스트 문서
{context}

위 정보를 바탕으로 출력 형식에 맞는 JSON을 생성해주세요.
"""

    # Gemini API 호출
    result_text = gemini_client.generate_text(
        prompt=user_prompt,
        system_prompt=system_prompt,
    )

    # JSON 파싱
    import json
    result = json.loads(result_text)

    # 저장
    gemini_client.save_output("01_product_info.json", result)
    print("[Agent 1] 정보수집 완료!")
    return result


if __name__ == "__main__":
    run()
