"""Render cardnews HTML slides to individual PNGs using Playwright."""
import sys
import os
from playwright.sync_api import sync_playwright

def render_cardnews(html_path: str, output_dir: str, prefix: str):
    """Render each slide in a cardnews HTML file to individual PNGs."""
    abs_html = os.path.abspath(html_path)
    os.makedirs(output_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1080, "height": 1350})
        page.goto(f"file://{abs_html}")
        page.wait_for_load_state("networkidle")

        slides = page.query_selector_all(".slide")
        total = len(slides)
        print(f"Found {total} slides in {os.path.basename(html_path)}")

        for i, slide in enumerate(slides):
            slide_num = f"{i+1:02d}"
            out_path = os.path.join(output_dir, f"{prefix}_slide_{slide_num}.png")
            slide.screenshot(path=out_path)
            size_kb = os.path.getsize(out_path) / 1024
            print(f"  [{slide_num}/{total}] {out_path} ({size_kb:.0f}KB)")

        browser.close()
        print(f"Done: {total} slides rendered to {output_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 render_cardnews.py <html_path> <output_dir> <prefix>")
        sys.exit(1)
    render_cardnews(sys.argv[1], sys.argv[2], sys.argv[3])
