#!/usr/bin/env python3
"""
범용 Gemini 이미지 생성 스크립트

사용법:
    python3 scripts/generate-image.py "프롬프트" [output.png] [--size 1080x1080]

필수 환경변수:
    GEMINI_API_KEY — Google AI Studio에서 발급 (https://aistudio.google.com/apikey)

예시:
    python3 scripts/generate-image.py "minimalist product photo, white background" product.png
    python3 scripts/generate-image.py "dark luxury background, golden light" bg.png --size 1920x1080
"""
import sys
import os
import argparse
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("google-genai 패키지가 필요합니다.")
    print("설치: pip3 install google-genai")
    sys.exit(1)


def generate_image(prompt: str, output_path: str, size: str = "1080x1080") -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")
        print("설정: export GEMINI_API_KEY=your_key")
        print("발급: https://aistudio.google.com/apikey")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    # NO TEXT 안전 장치 추가
    safe_prompt = prompt
    if "NO TEXT" not in prompt.upper():
        safe_prompt += ", absolutely NO TEXT, NO LETTERS, NO WORDS, NO WATERMARKS"

    config = types.GenerateContentConfig(
        temperature=0.8,
        response_modalities=["IMAGE", "TEXT"],
    )

    print(f"Generating: {prompt[:80]}...")
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=safe_prompt,
        config=config,
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data and part.inline_data.mime_type.startswith("image/"):
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(part.inline_data.data)
            print(f"Image saved: {output_path}")
            return output_path

    raise ValueError("응답에 이미지 데이터가 없습니다")


def main():
    parser = argparse.ArgumentParser(description="Gemini image generator")
    parser.add_argument("prompt", help="Image generation prompt")
    parser.add_argument("output", nargs="?", default="output.png", help="Output file path")
    parser.add_argument("--size", default="1080x1080", help="Image size (e.g. 1080x1080)")
    args = parser.parse_args()

    generate_image(args.prompt, args.output, args.size)


if __name__ == "__main__":
    main()
