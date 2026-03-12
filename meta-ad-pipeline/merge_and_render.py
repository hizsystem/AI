"""
배경 이미지 + HTML 텍스트 합성 → 최종 PNG 렌더링
Gemini 배경 비주얼 위에 HTML/CSS 텍스트를 오버레이한다.
"""
from __future__ import annotations

import asyncio
import base64
import sys
from pathlib import Path


def img_to_base64(img_path: str) -> str:
    """이미지를 base64 data URI로 변환"""
    with open(img_path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/png;base64,{data}"


def inject_background(html_content: str, bg_base64: str) -> str:
    """HTML의 body/slide에 배경 이미지를 주입"""
    # body 스타일에 background-image 추가
    # 기존 background 속성을 대체
    import re

    # .slide에 배경 이미지 + 오버레이 추가
    bg_css = f"""
.bg-layer {{
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background-image: url('{bg_base64}');
    background-size: cover;
    background-position: center;
    z-index: 0;
}}
.bg-overlay {{
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    z-index: 1;
}}
/* 콘텐츠 영역 — position: relative로 배경 위에 표시 */
.content {{ position: relative !important; z-index: 5 !important; }}
.header {{ position: relative !important; z-index: 5 !important; }}
.grid {{ position: relative !important; z-index: 5 !important; }}
.bottom-msg {{ position: relative !important; z-index: 5 !important; }}
/* 절대 위치 요소 — position: absolute 유지 */
.logo {{ position: absolute !important; z-index: 10 !important; }}
.cta-bar {{ position: absolute !important; z-index: 10 !important; }}
/* 장식 요소 */
.network-bg {{ z-index: 2 !important; }}
"""

    # </style> 앞에 추가 CSS 삽입
    html_content = html_content.replace("</style>", bg_css + "</style>")

    # <div class="slide"> 바로 뒤에 배경 레이어 삽입
    html_content = html_content.replace(
        '<div class="slide">',
        '<div class="slide">\n    <div class="bg-layer"></div>\n    <div class="bg-overlay"></div>'
    )

    return html_content


# 각 광고별 오버레이 색상 (배경 위에 반투명 레이어)
OVERLAY_STYLES = {
    "ad_success_stories": "background: linear-gradient(180deg, rgba(239,246,255,0.82) 0%, rgba(255,255,255,0.88) 50%, rgba(239,246,255,0.82) 100%);",
    "ad_brand_design": "background: linear-gradient(180deg, rgba(15,23,42,0.78) 0%, rgba(7,11,20,0.82) 100%);",
    "ad_oliveyoung": "background: linear-gradient(180deg, rgba(236,253,245,0.80) 0%, rgba(255,255,255,0.85) 50%, rgba(240,253,244,0.80) 100%);",
    "ad_meta_roas": "background: rgba(10,10,10,0.75);",
    "ad_viral": "background: linear-gradient(180deg, rgba(13,8,32,0.75) 0%, rgba(26,16,64,0.78) 100%);",
}


async def merge_and_render(
    templates_dir: str = "templates",
    bg_dir: str = "outputs/backgrounds",
    output_dir: str = "outputs/images",
):
    """배경 + HTML 합성 후 최종 PNG 렌더링"""
    from playwright.async_api import async_playwright

    templates_dir = Path(templates_dir)
    bg_dir = Path(bg_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # 임시 합성 HTML 저장 디렉토리
    merged_dir = Path("outputs/merged_html")
    merged_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*50}")
    print(f"  배경 합성 + 최종 PNG 렌더링")
    print(f"{'='*50}\n")

    results = []

    for name, overlay_style in OVERLAY_STYLES.items():
        html_file = templates_dir / f"{name}.html"
        bg_file = bg_dir / f"{name}_bg.png"

        if not html_file.exists():
            print(f"  [{name}] HTML 템플릿 없음 - 건너뜀")
            continue
        if not bg_file.exists():
            print(f"  [{name}] 배경 이미지 없음 - 건너뜀")
            continue

        print(f"  [{name}] 합성 중...")

        # 1. 배경 이미지를 base64로 변환
        bg_b64 = img_to_base64(str(bg_file))

        # 2. HTML 읽기
        html_content = html_file.read_text(encoding="utf-8")

        # 3. 배경 + 오버레이 주입
        merged_html = inject_background(html_content, bg_b64)

        # 오버레이 스타일 적용
        merged_html = merged_html.replace(
            "z-index: 1;\n}",
            f"z-index: 1;\n    {overlay_style}\n}}"
        )

        # 4. 합성 HTML 저장
        merged_path = merged_dir / f"{name}.html"
        merged_path.write_text(merged_html, encoding="utf-8")

        results.append((name, merged_path))
        print(f"  [{name}] HTML 합성 완료")

    # 5. Playwright로 최종 PNG 렌더링
    print(f"\n  PNG 렌더링 시작...\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1080, "height": 1080})

        for name, merged_path in results:
            output_path = output_dir / f"{name}_final.png"
            await page.goto(f"file://{merged_path.resolve()}")
            await page.wait_for_timeout(2500)  # 폰트 + 이미지 로딩 대기
            await page.screenshot(path=str(output_path), type="png")
            print(f"  [완료] {name} → {output_path.name}")

        await browser.close()

    print(f"\n  총 {len(results)}개 최종 이미지 생성! → {output_dir}")


if __name__ == "__main__":
    asyncio.run(merge_and_render())
