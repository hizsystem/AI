"""
Gemini API 공통 클라이언트
텍스트 생성 + 이미지 생성을 통합 관리한다.
"""
from __future__ import annotations

import json
import os
import time
import base64
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    raise ImportError(
        "google-genai 패키지가 필요합니다.\n"
        "설치: pip install google-genai"
    )


def load_config() -> dict:
    """config.json 로드"""
    config_path = Path(__file__).parent / "config.json"
    with open(config_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_client() -> genai.Client:
    """Gemini API 클라이언트 생성"""
    config = load_config()
    api_key = os.environ.get(config["gemini"]["api_key_env"])
    if not api_key:
        raise ValueError(
            f"환경변수 {config['gemini']['api_key_env']}가 설정되지 않았습니다.\n"
            f"설정: export {config['gemini']['api_key_env']}=your_key"
        )
    return genai.Client(api_key=api_key)


def generate_text(
    prompt: str,
    system_prompt: str = "",
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> str:
    """텍스트 생성 (에이전트 실행용)"""
    config = load_config()
    client = get_client()

    model = config["gemini"]["model_text"]
    temp = temperature or config["gemini"]["temperature_text"]
    tokens = max_tokens or config["gemini"]["max_tokens_text"]

    generation_config = types.GenerateContentConfig(
        temperature=temp,
        max_output_tokens=tokens,
        response_mime_type="application/json",
    )

    if system_prompt:
        generation_config.system_instruction = system_prompt

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=generation_config,
            )
            return response.text
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  [재시도 {attempt + 1}/{max_retries}] {e} — {wait}초 대기")
                time.sleep(wait)
            else:
                raise


def generate_image(
    prompt: str,
    output_path: str,
    size: str = "1080x1080",
) -> str:
    """이미지 생성 (Gemini Imagen)"""
    config = load_config()
    client = get_client()

    model = config["gemini"]["model_image"]

    generation_config = types.GenerateContentConfig(
        temperature=config["gemini"]["temperature_image"],
        response_modalities=["IMAGE", "TEXT"],
    )

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=generation_config,
            )

            # 이미지 데이터 추출 및 저장
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                    image_data = part.inline_data.data
                    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(image_data)
                    print(f"  [이미지 저장] {output_path}")
                    return output_path

            raise ValueError("응답에 이미지 데이터가 없습니다")

        except Exception as e:
            if attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  [재시도 {attempt + 1}/{max_retries}] {e} — {wait}초 대기")
                time.sleep(wait)
            else:
                raise


def load_prompt(agent_id: int) -> str:
    """에이전트 시스템 프롬프트 로드"""
    config = load_config()
    prompts_dir = Path(__file__).parent / config["paths"]["prompts_dir"]
    agent_info = config["pipeline"]["agents"][agent_id - 1]
    prompt_file = prompts_dir / f"{agent_info['output'].replace('.json', '.md').replace('01_product_info', '01_info_collector').replace('02_research', '02_researcher').replace('03_copy', '03_copywriter').replace('04_design', '04_designer').replace('05_prompts', '05_prompt_engineer')}"

    # 파일명 매핑
    prompt_files = {
        1: "01_info_collector.md",
        2: "02_researcher.md",
        3: "03_copywriter.md",
        4: "04_designer.md",
        5: "05_prompt_engineer.md",
    }

    prompt_file = prompts_dir / prompt_files[agent_id]

    with open(prompt_file, "r", encoding="utf-8") as f:
        return f.read()


def load_output(filename: str) -> dict:
    """이전 에이전트의 JSON 산출물 로드"""
    config = load_config()
    output_path = Path(__file__).parent / config["paths"]["outputs_dir"] / filename
    if not output_path.exists():
        return {}
    with open(output_path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_output(filename: str, data: dict) -> str:
    """에이전트 산출물 JSON 저장"""
    config = load_config()
    output_path = Path(__file__).parent / config["paths"]["outputs_dir"] / filename
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  [저장 완료] {output_path}")
    return str(output_path)


def load_context() -> str:
    """컨텍스트 파일(세일즈 플랜 등) 로드"""
    config = load_config()
    context_dir = Path(__file__).parent / config["paths"]["context_dir"]
    context_text = ""
    if context_dir.exists():
        for f in sorted(context_dir.glob("*.md")):
            context_text += f"\n\n--- {f.name} ---\n\n"
            context_text += f.read_text(encoding="utf-8")
    return context_text
