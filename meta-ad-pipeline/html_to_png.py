"""
HTML → PNG 변환기 (Playwright 기반)
HTML 슬라이드 파일을 1080x1080 PNG로 렌더링한다.
"""
from __future__ import annotations

import sys
import asyncio
from pathlib import Path


async def render_html_to_png(html_path: str, output_path: str, width: int = 1080, height: int = 1080):
    """HTML 파일을 PNG로 렌더링"""
    from playwright.async_api import async_playwright

    html_path = str(Path(html_path).resolve())
    output_path = str(Path(output_path).resolve())
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": width, "height": height})

        await page.goto(f"file://{html_path}")
        # 폰트 로딩 대기
        await page.wait_for_timeout(2000)

        await page.screenshot(path=output_path, type="png")
        await browser.close()

    print(f"  [PNG 저장] {output_path}")
    return output_path


def render(html_path: str, output_path: str, width: int = 1080, height: int = 1080):
    """동기 래퍼"""
    return asyncio.run(render_html_to_png(html_path, output_path, width, height))


async def render_all(html_dir: str, output_dir: str):
    """디렉토리 내 모든 HTML을 PNG로 변환"""
    from playwright.async_api import async_playwright

    html_dir = Path(html_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    html_files = sorted(html_dir.glob("*.html"))
    if not html_files:
        print("변환할 HTML 파일이 없습니다.")
        return

    print(f"\n{'='*50}")
    print(f"  HTML → PNG 변환 ({len(html_files)}개)")
    print(f"{'='*50}\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1080, "height": 1080})

        for html_file in html_files:
            png_name = html_file.stem + ".png"
            output_path = output_dir / png_name

            await page.goto(f"file://{html_file.resolve()}")
            await page.wait_for_timeout(2000)
            await page.screenshot(path=str(output_path), type="png")
            print(f"  [완료] {html_file.name} → {png_name}")

        await browser.close()

    print(f"\n  총 {len(html_files)}개 변환 완료! → {output_dir}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("사용법: python html_to_png.py <html_dir> <output_dir>")
        print("  또는: python html_to_png.py <single.html> <output.png>")
        sys.exit(1)

    src, dst = sys.argv[1], sys.argv[2]

    if Path(src).is_dir():
        asyncio.run(render_all(src, dst))
    else:
        render(src, dst)
