"""
Gemini Imagen으로 광고 배경 이미지 생성 (텍스트 없이 비주얼만)
생성된 배경은 HTML 템플릿에 합성되어 최종 PNG로 렌더링된다.
"""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from gemini_client import generate_image


# 각 광고별 배경 프롬프트 (텍스트 절대 없이, 순수 비주얼만)
BG_PROMPTS = {
    "ad_success_stories": (
        "Professional business atmosphere background image, "
        "soft blue and white gradient sky with floating translucent glass panels, "
        "subtle bokeh light particles, clean corporate aesthetic, "
        "modern office building reflection, airy and bright mood, "
        "absolutely NO TEXT anywhere, NO LETTERS, NO WORDS, NO WATERMARKS, "
        "purely photographic visual, square format 1080x1080"
    ),
    "ad_brand_design": (
        "Dark luxury premium background, deep navy to black gradient, "
        "golden light streaks, abstract 3D geometric shapes floating, "
        "sleek metallic textures, product showcase podium atmosphere, "
        "dramatic lighting from top, NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, "
        "purely visual abstract, 1080x1080"
    ),
    "ad_oliveyoung": (
        "Fresh clean beauty cosmetics background, soft mint green and white gradient, "
        "botanical leaf shadows, glass texture elements, natural light, "
        "beauty product display atmosphere, clean minimal aesthetic, water droplets, "
        "NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, purely visual, 1080x1080"
    ),
    "ad_meta_roas": (
        "Dark tech data analytics dashboard background, deep black with orange glow accents, "
        "abstract data visualization lines, glowing graph lines, "
        "digital performance metrics atmosphere, futuristic HUD style, "
        "orange and dark gradient, NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, "
        "purely visual abstract, 1080x1080"
    ),
    "ad_viral": (
        "Abstract social network visualization background, deep purple to dark gradient, "
        "glowing connected nodes and lines, network graph, digital constellation, "
        "viral spread pattern, energy pulse waves, neon purple glow, "
        "NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, purely visual, 1080x1080"
    ),
}


def generate_backgrounds(output_dir: str = "outputs/backgrounds"):
    """5개 광고 배경 이미지 생성"""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*50}")
    print(f"  배경 이미지 생성 (Gemini Imagen)")
    print(f"  텍스트 없이 순수 비주얼만 생성합니다")
    print(f"{'='*50}\n")

    results = {}
    for name, prompt in BG_PROMPTS.items():
        output_path = str(output_dir / f"{name}_bg.png")
        print(f"  [{name}] 배경 생성 중...")
        try:
            result = generate_image(prompt, output_path)
            results[name] = result
            print(f"  [{name}] 완료!\n")
        except Exception as e:
            print(f"  [{name}] 실패: {e}\n")
            results[name] = None

    success = sum(1 for v in results.values() if v)
    print(f"\n  총 {success}/{len(results)}개 배경 생성 완료! → {output_dir}")
    return results


if __name__ == "__main__":
    output_dir = sys.argv[1] if len(sys.argv) > 1 else "outputs/backgrounds"
    generate_backgrounds(output_dir)
