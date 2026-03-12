"""
Daily Content Pipeline Runner
Claude Code 세션에서 실행하는 파이프라인 유틸리티.
Slack MCP 호출은 Claude가 직접 수행하고, 이 스크립트는 로컬 작업을 처리한다.
"""
from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CONFIG_PATH = BASE_DIR / "config" / "pipeline.json"


def load_config() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def get_topic_context() -> str:
    """주제 제안을 위한 컨텍스트 수집"""
    context_parts = []

    # 1. 피드백 히스토리
    feedback_path = BASE_DIR / "feedback" / "feedback.md"
    if feedback_path.exists():
        context_parts.append("=== 피드백 히스토리 ===")
        context_parts.append(feedback_path.read_text(encoding="utf-8")[-2000:])

    # 2. 기존 템플릿 목록 (이미 만든 주제 확인)
    templates_dir = BASE_DIR / "templates"
    if templates_dir.exists():
        existing = [f.stem for f in templates_dir.glob("*.html")]
        context_parts.append(f"\n=== 기존 템플릿 ({len(existing)}개) ===")
        context_parts.append(", ".join(existing))

    # 3. 서비스 테마 (tokens.json)
    tokens_path = BASE_DIR / "design-system" / "tokens.json"
    if tokens_path.exists():
        tokens = json.loads(tokens_path.read_text(encoding="utf-8"))
        themes = list(tokens.get("service_themes", {}).keys())
        context_parts.append(f"\n=== 서비스 테마 ===")
        context_parts.append(", ".join(themes))

    # 4. 컨텍스트 폴더
    context_dir = BASE_DIR / "context"
    if context_dir.exists():
        for f in context_dir.glob("*.md"):
            content = f.read_text(encoding="utf-8")[:500]
            context_parts.append(f"\n=== {f.name} ===")
            context_parts.append(content)

    return "\n".join(context_parts)


def render_template(template_name: str) -> dict:
    """HTML 템플릿 → PNG 렌더링 (배경 없이 단독 렌더링)"""
    import asyncio

    async def _render():
        from playwright.async_api import async_playwright

        template_path = BASE_DIR / "templates" / f"{template_name}.html"
        output_path = BASE_DIR / "outputs" / "images" / f"{template_name}.png"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if not template_path.exists():
            return {"status": "fail", "error": f"템플릿 없음: {template_path}"}

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page(viewport={"width": 1080, "height": 1080})
            await page.goto(f"file://{template_path.resolve()}")
            await page.wait_for_timeout(2500)
            await page.screenshot(path=str(output_path), type="png")
            await browser.close()

        return {"status": "pass", "output": str(output_path)}

    return asyncio.run(_render())


def run_qa(image_path: str) -> dict:
    """QA 검증 실행"""
    sys.path.insert(0, str(BASE_DIR / "tools"))
    from validate_slide import run_validation
    return run_validation(image_path)


def generate_caption(
    project_name: str,
    headline: str,
    sub_copy: str,
    cta: str,
    hashtags: list[str] | None = None,
) -> str:
    """인스타그램 캡션 생성"""
    default_tags = [
        "#브랜드라이즈", "#brandrise", "#리브랜딩", "#브랜딩",
        "#스타트업마케팅", "#브랜드전략", "#마케팅에이전시",
    ]
    tags = hashtags or default_tags

    caption = f"""{headline}

{sub_copy}

{cta}

─────────────────
{' '.join(tags)}"""

    return caption


def save_caption(name: str, caption: str) -> str:
    """캡션 파일 저장"""
    output_dir = BASE_DIR / "outputs" / "captions"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{name}.txt"
    output_path.write_text(caption, encoding="utf-8")
    return str(output_path)


def get_today_str() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def get_tomorrow_9am_timestamp() -> int:
    """내일 아침 9시 KST Unix timestamp"""
    from datetime import timedelta
    tomorrow = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    if tomorrow <= datetime.now():
        tomorrow += timedelta(days=1)
    return int(tomorrow.timestamp())


def pipeline_status() -> dict:
    """현재 파이프라인 상태 요약"""
    config = load_config()

    # 산출물 개수
    images_dir = BASE_DIR / "outputs" / "images"
    templates_dir = BASE_DIR / "templates"
    captions_dir = BASE_DIR / "outputs" / "captions"

    return {
        "date": get_today_str(),
        "slack_channel": config["slack"]["channel_name"],
        "templates": len(list(templates_dir.glob("*.html"))) if templates_dir.exists() else 0,
        "images": len(list(images_dir.glob("*.png"))) if images_dir.exists() else 0,
        "captions": len(list(captions_dir.glob("*.txt"))) if captions_dir.exists() else 0,
        "feedback_entries": _count_feedback_entries(),
    }


def _count_feedback_entries() -> int:
    feedback_path = BASE_DIR / "feedback" / "feedback.md"
    if not feedback_path.exists():
        return 0
    content = feedback_path.read_text(encoding="utf-8")
    return content.count("### [")


if __name__ == "__main__":
    print(f"\n{'='*50}")
    print(f"  brandrise Daily Content Pipeline")
    print(f"{'='*50}\n")

    status = pipeline_status()
    print(f"  날짜: {status['date']}")
    print(f"  Slack: {status['slack_channel']}")
    print(f"  템플릿: {status['templates']}개")
    print(f"  이미지: {status['images']}개")
    print(f"  캡션: {status['captions']}개")
    print(f"  피드백: {status['feedback_entries']}건")
    print(f"\n  컨텍스트 로드...")

    ctx = get_topic_context()
    print(f"  컨텍스트: {len(ctx)}자 수집")
    print(f"\n  준비 완료! Claude Code에서 파이프라인을 실행하세요.")
    print(f"  > '오늘 콘텐츠 만들어줘'")
    print()
